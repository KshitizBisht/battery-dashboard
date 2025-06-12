const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mqtt = require('mqtt');

// MQTT Setup
const brokerUrl = '';
const mqttOptions = {
    username: '',
    password: '',
};

const client = mqtt.connect(brokerUrl, mqttOptions);
client.on('connect', () => console.log('✅ Connected to MQTT broker'));
client.on('error', (err) => console.error('❌ MQTT connection error:', err));

const DATA_DIR = path.join(__dirname, './cleaned_dataset/data');
const METADATA_PATH = path.join(__dirname, './cleaned_dataset/metadata.csv');
const TARGET_BATTERY_IDS = ['B0005', 'B0006', 'B0007'];
const NOMINAL_CAPACITY = 2.6; // Ah (for 18650 cell)

const batteryFiles = {};
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function estimateSOC(voltage, ambientTemp) {
    const minVoltage = 3.0;
    const maxVoltage = 4.2;
    const tempCorrection = (ambientTemp - 25) * 0.002;
    const adjustedVoltage = voltage + tempCorrection;
    const clamped = Math.min(Math.max(adjustedVoltage, minVoltage), maxVoltage);
    return ((clamped - minVoltage) / (maxVoltage - minVoltage)) * 100;
}

async function parseMetadata() {
    const rl = readline.createInterface({
        input: fs.createReadStream(METADATA_PATH),
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const [type, startTime, ambientTemp, batteryId, testId, uid, filename] = line.split(',');

        if (TARGET_BATTERY_IDS.includes(batteryId) && filename && startTime) {
            batteryFiles[batteryId] = batteryFiles[batteryId] || [];
            batteryFiles[batteryId].push({ filename, startTime });
        }
    }

    for (const batteryId of TARGET_BATTERY_IDS) {
        batteryFiles[batteryId]?.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );
    }

    console.log('📄 Metadata parsed and sorted');
}

async function publishTelemetry() {
    const batteryData = TARGET_BATTERY_IDS.map((id) => ({
        batteryId: id,
        files: batteryFiles[id] || [],
    }));

    const maxFiles = Math.max(...batteryData.map((b) => b.files.length));

    for (let i = 0; i < maxFiles; i++) {
        const group = batteryData.map(async ({ batteryId, files }) => {
            if (i >= files.length) return;

            const { filename } = files[i];
            const filePath = path.join(DATA_DIR, filename);

            if (!fs.existsSync(filePath)) return;

            const lines = fs.readFileSync(filePath, 'utf-8')
                .split('\n')
                .filter((line) => line.trim() !== '');

            let previousTime = 0;

            for (const line of lines) {
                const [v, c, t, lc, lv, timeStr] = line.split(',');
                const time = parseFloat(timeStr);
                if (isNaN(time)) continue;

                const voltage = parseFloat(v);
                const current = parseFloat(c);
                const temp = parseFloat(t);
                const loadCurrent = parseFloat(lc);
                const loadVoltage = parseFloat(lv);

                const soc = estimateSOC(voltage, temp);
                const estimatedCapacity = (soc / 100) * NOMINAL_CAPACITY;

                const dataPoint = {
                    batteryId,
                    timestamp: new Date().toISOString(),
                    voltage,
                    current,
                    temperature: temp,
                    loadCurrent,
                    loadVoltage,
                    time,
                    soc: soc.toFixed(2),
                    capacity: {
                        nominal: NOMINAL_CAPACITY,
                        estimatedRemaining: estimatedCapacity.toFixed(3),
                    },
                };

                const topic = `battery/${batteryId}/data`;
                client.publish(topic, JSON.stringify(dataPoint), (err) => {
                    if (err) {
                        console.error(`❌ Failed to publish to ${topic}:`, err);
                    } else {
                        console.log(`📡 Published to ${topic} @ t=${time}s`);
                    }
                });

                const wait = Math.max(0, (time - previousTime) * 100);
                previousTime = time;
                await delay(wait);
            }
        });

        await Promise.all(group);
    }

    console.log('✅ All telemetry data published.');
}

async function main() {
    try {
        await parseMetadata();
        await publishTelemetry();
    } catch (err) {
        console.error('❌ Error during execution:', err);
    }
}

main();