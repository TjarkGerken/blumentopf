# Blumentopf IoT Device Setup Guide

## 🔧 Hardware Requirements

### Required Components

- **Raspberry Pi 4** (or compatible single-board computer)
- **Water pump** (5V DC submersible pump recommended)
- **Relay module** (5V relay for pump control)
- **Sensors**:
  - Soil moisture sensor (analog or digital)
  - DHT22 temperature/humidity sensor
  - LDR (Light Dependent Resistor) for light sensing
- **Water reservoir** (container with tubing)
- **Power supply** (5V, 3A for Raspberry Pi + pump)
- **Jumper wires** and **breadboard**

### GPIO Pin Configuration (Raspberry Pi)

```
GPIO 18 - Water pump relay (OUTPUT)
GPIO 21 - Soil moisture sensor (INPUT)
GPIO 22 - DHT22 temperature sensor (INPUT)
GPIO 23 - Light sensor (ANALOG INPUT via MCP3008)
```

## 📦 Software Installation

### 1. Install Required Python Packages

```bash
pip3 install requests RPi.GPIO adafruit-circuitpython-dht
```

### 2. Set Environment Variables

Create a `.env` file or export these variables:

```bash
export BLUMENTOPF_DEVICE_ID="your-device-uuid-from-supabase"
export SUPABASE_ANON_KEY="your-supabase-anonymous-key"
export SUPABASE_URL="https://roufluqgmrwmdhrektcr.supabase.co"
export PUMP_GPIO="18"
export MOISTURE_PIN="21"
export TEMPERATURE_PIN="22"
export LIGHT_PIN="23"
```

### 3. Get Your Device UUID

1. Open your mobile app
2. Go to Settings → Device Management
3. Add a new device and note the generated UUID
4. Use this UUID for `BLUMENTOPF_DEVICE_ID`

## 🔌 Hardware Wiring

### Water Pump Circuit

```
Raspberry Pi GPIO 18 → Relay IN
Relay VCC → Raspberry Pi 5V
Relay GND → Raspberry Pi GND
Relay COM → Pump +
Relay NO → Power Supply +
Pump - → Power Supply -
```

### Sensor Connections

```
DHT22 Temperature Sensor:
- VCC → Raspberry Pi 3.3V
- GND → Raspberry Pi GND
- DATA → GPIO 22

Soil Moisture Sensor:
- VCC → Raspberry Pi 3.3V
- GND → Raspberry Pi GND
- DATA → GPIO 21

Light Sensor (with MCP3008 ADC):
- MCP3008 CH0 → LDR + 10kΩ resistor
- MCP3008 → SPI connection to Raspberry Pi
```

## 🚀 Running the Device

### 1. Test Hardware

```bash
# Test GPIO setup
python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BCM); print('GPIO OK')"

# Test sensors
python3 -c "
import adafruit_dht
import board
dht = adafruit_dht.DHT22(board.D22)
temp = dht.temperature
print(f'Temperature: {temp}°C')
"
```

### 2. Run Device Software

```bash
# Make the script executable
chmod +x blumentopf_device.py

# Run the device
python3 blumentopf_device.py
```

### 3. Set Up as System Service (Optional)

Create `/etc/systemd/system/blumentopf.service`:

```ini
[Unit]
Description=Blumentopf IoT Device
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blumentopf
ExecStart=/usr/bin/python3 /home/pi/blumentopf/blumentopf_device.py
Restart=always
RestartSec=10
Environment=BLUMENTOPF_DEVICE_ID=your-device-uuid
Environment=SUPABASE_ANON_KEY=your-key

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable blumentopf.service
sudo systemctl start blumentopf.service
sudo systemctl status blumentopf.service
```

## 🔍 Troubleshooting

### Device Not Connecting

1. Check internet connection
2. Verify environment variables are set correctly
3. Check Supabase URL and API key
4. Look at device logs: `sudo journalctl -u blumentopf.service -f`

### Pump Not Working

1. Test relay manually with GPIO commands
2. Check power supply voltage (should be 5V)
3. Verify wiring connections
4. Test pump separately with direct power

### Sensor Reading Issues

1. Check sensor connections
2. Verify sensor power (3.3V for most sensors)
3. Test sensors individually
4. Check for loose connections

### Permission Issues

```bash
# Add user to GPIO group
sudo usermod -a -G gpio pi

# Set GPIO permissions
sudo chmod 666 /dev/gpiomem
```

## 📊 Monitoring

### Check Device Status

- Open mobile app → Device Details
- Status should show "Online" with recent sensor readings
- Monitor water reservoir level and battery (if applicable)

### View Logs

```bash
# Real-time logs
tail -f /var/log/blumentopf.log

# Systemd service logs
sudo journalctl -u blumentopf.service -f

# Application logs
python3 blumentopf_device.py --verbose
```

### Test Watering Command

1. Open mobile app
2. Go to plant details with associated device
3. Tap "Water Now"
4. Monitor device logs for command processing
5. Verify pump activation and completion

## 🛡️ Security Notes

- **Network Security**: Use WPA2/WPA3 for WiFi
- **API Keys**: Keep Supabase keys secure, don't commit to version control
- **Device Access**: Change default SSH passwords
- **Updates**: Keep Raspberry Pi OS and packages updated

## 📡 Network Requirements

- **WiFi Connection**: 2.4GHz recommended for better range
- **Bandwidth**: Minimal (<1KB per minute for status updates)
- **Ports**: HTTPS (443) outbound to Supabase
- **Firewall**: No inbound ports required

## 🔄 Update Process

### Software Updates

```bash
# Update device software
cd /home/pi/blumentopf
git pull origin main  # if using git
sudo systemctl restart blumentopf.service
```

### Firmware Updates

```bash
# Update Raspberry Pi OS
sudo apt update && sudo apt upgrade -y
sudo reboot
```

## 📈 Performance Optimization

### Reduce Power Consumption

- Use sleep modes between operations
- Optimize sensor reading frequency
- Use efficient pump control (PWM for variable speed)

### Improve Reliability

- Add retry logic for network operations
- Implement graceful error handling
- Use hardware watchdog timer
- Monitor system health metrics

## 🎯 Configuration Examples

### High-Frequency Monitoring (Every 30 seconds)

```python
# In blumentopf_device.py, change:
time.sleep(30)  # Poll every 30 seconds
```

### Water-Saving Mode

```python
# Reduce default water amounts by 20%
amount_ml = int(command.water_amount * 0.8)
```

### Debug Mode

```python
# Enable verbose logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 🧪 Testing Commands

### Manual Watering Test

```bash
# Test via Supabase function directly
curl -X POST "https://roufluqgmrwmdhrektcr.supabase.co/rest/v1/rpc/send_watering_command" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_device_id": "your-device-uuid",
    "p_water_amount": 100,
    "p_command_type": "water_now"
  }'
```

### Sensor Reading Test

```python
# Test sensors individually
python3 -c "
from blumentopf_device import BlumentopfDevice
import os

config = {
    'device_id': os.getenv('BLUMENTOPF_DEVICE_ID'),
    'supabase_url': os.getenv('SUPABASE_URL'),
    'api_key': os.getenv('SUPABASE_ANON_KEY')
}

device = BlumentopfDevice(config)
readings = device.read_sensors()
print(f'Readings: {readings}')
"
```
