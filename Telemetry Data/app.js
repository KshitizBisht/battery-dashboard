const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mqtt = require('mqtt');

const brokerUrl = '';
const mqttOptions = {
    username: '',
    password: '',
};

const client = mqtt.connect(brokerUrl, mqttOptions);

client.on('connect', () => console.log('Connected to MQTT broker'));
client.on('error', (err) => console.error('MQTT connection error:', err));

const metadataPath = path.join(__dirname, './cleaned_dataset/metadata.csv');
const dataDir = path.join(__dirname, './cleaned_dataset/data');
const targetBatteryIds = ['B0005', 'B0006', 'B0007'];
const batteryFiles = {};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const parseMetadata = () => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(metadataPath),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            const [type, startTime, ambientTemp, batteryId, testId, uid, filename] = line.split(',');
            if (targetBatteryIds.includes(batteryId) && filename && startTime) {
                batteryFiles[batteryId] = batteryFiles[batteryId] || [];
                batteryFiles[batteryId].push({ filename, startTime });
            }
        });

        rl.on('close', () => {
            targetBatteryIds.forEach((batteryId) => {
                batteryFiles[batteryId]?.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            });
            resolve();
        });

        rl.on('error', reject);
    });
};

const publishWithSimulatedTime = async () => {
    const batteryData = targetBatteryIds.map((batteryId) => ({
        batteryId,
        files: batteryFiles[batteryId] || [],
    }));

    const maxFiles = Math.max(...batteryData.map((b) => b.files.length));

    for (let fileIndex = 0; fileIndex < maxFiles; fileIndex++) {
        const streamGroup = batteryData.map(async ({ batteryId, files }) => {
            if (fileIndex < files.length) {
                const { filename } = files[fileIndex];
                const filePath = path.join(dataDir, filename);

                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const lines = fileContent.split('\n').filter((line) => line.trim() !== '');

                    let previousTime = 0;

                    for (const line of lines) {
                        const [voltage, current, temperature, loadCurrent, loadVoltage, timeStr] = line.split(',');
                    
                        if (isNaN(parseFloat(timeStr))) continue;
                    
                        const time = parseFloat(timeStr);
                        const waitTime = Math.max(0, (time - previousTime) * 1000);
                        previousTime = time;
                    
                        const dataPoint = {
                            batteryId,
                            timestamp: new Date().toISOString(),
                            voltage: parseFloat(voltage),
                            current: parseFloat(current),
                            temperature: parseFloat(temperature),
                            loadCurrent: parseFloat(loadCurrent),
                            loadVoltage: parseFloat(loadVoltage),
                            time,
                        };
                    
                        const topic = `battery/${batteryId}/data`;
                    
                        client.publish(topic, JSON.stringify(dataPoint), (err) => {
                            if (err) {
                                console.error(`Failed to publish to ${topic}:`, err);
                            } else {
                                console.log(`Published to ${topic} @ t=${time}s`);
                            }
                        });
                    
                        await delay(waitTime);
                    }
                }
            }
        });

        await Promise.all(streamGroup);
    }

    console.log('Finished publishing all simulated data.');
};

// Entry Point
const start = async () => {
    try {
        await parseMetadata();
        await publishWithSimulatedTime();
    } catch (err) {
        console.error('Error during execution:', err);
    }
};

start();


