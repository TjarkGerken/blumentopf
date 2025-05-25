#!/usr/bin/env python3
"""
Blumentopf IoT Device Controller
This script runs on the IoT device (Raspberry Pi/ESP32) and communicates with Supabase
to receive watering commands and report device status.

Setup Instructions:
1. Install required packages: pip install requests
2. Set environment variables:
   - BLUMENTOPF_DEVICE_ID: Your device UUID from Supabase
   - SUPABASE_ANON_KEY: Your Supabase anonymous key
3. Configure GPIO pins for your hardware setup
4. Run: python3 blumentopf_device.py
"""

import requests
import time
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import os
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class WateringCommand:
    command_id: str
    command_type: str
    water_amount: int
    created_at: str

@dataclass
class SensorReadings:
    moisture: float
    temperature: float
    light: float
    timestamp: str

class BlumentopfDevice:
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the Blumentopf device
        
        Args:
            config: Configuration dictionary containing:
                - device_id: UUID of the device in Supabase
                - supabase_url: Supabase project URL
                - api_key: Supabase anon key
                - pump_gpio: GPIO pin for water pump (if using GPIO)
                - sensor_config: Sensor configuration
        """
        self.device_id = config['device_id']
        self.supabase_url = config['supabase_url'].rstrip('/')
        self.api_key = config['api_key']
        self.pump_gpio = config.get('pump_gpio', 18)
        self.sensor_config = config.get('sensor_config', {})
        
        # Device state
        self.is_watering = False
        self.pump_status = 'idle'
        self.current_activity = 'idle'
        self.water_reservoir_ml = 1000  # Default full reservoir
        self.last_sensor_reading: Optional[SensorReadings] = None
        
        # Initialize hardware (if running on actual device)
        self._init_hardware()
        
        logger.info(f"Blumentopf device {self.device_id} initialized")

    def _init_hardware(self):
        """Initialize GPIO and sensors (mock for development)"""
        try:
            # Mock GPIO initialization - replace with actual GPIO setup
            logger.info("Hardware initialized (GPIO pins configured)")
        except Exception as e:
            logger.warning(f"Hardware initialization failed: {e}")

    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to Supabase"""
        url = f"{self.supabase_url}/rest/v1/rpc/{endpoint}"
        headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to {endpoint} failed: {e}")
            raise

    def poll_commands(self) -> List[WateringCommand]:
        """Poll Supabase for pending watering commands"""
        try:
            result = self._make_request('get_pending_commands', {
                'p_device_id': self.device_id
            })
            
            commands = []
            for cmd_data in result:
                commands.append(WateringCommand(
                    command_id=cmd_data['command_id'],
                    command_type=cmd_data['command_type'],
                    water_amount=cmd_data['water_amount'],
                    created_at=cmd_data['created_at']
                ))
            
            return commands
            
        except Exception as e:
            logger.error(f"Failed to poll commands: {e}")
            return []

    def acknowledge_command(self, command_id: str) -> bool:
        """Acknowledge receipt of a watering command"""
        try:
            result = self._make_request('acknowledge_command', {
                'p_command_id': command_id,
                'p_device_id': self.device_id
            })
            
            if result.get('success'):
                logger.info(f"Command {command_id} acknowledged")
                return True
            else:
                logger.error(f"Failed to acknowledge command: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to acknowledge command {command_id}: {e}")
            return False

    def complete_command(self, command_id: str, success: bool, 
                        actual_amount: Optional[int] = None, 
                        error_message: Optional[str] = None) -> bool:
        """Report completion of a watering command"""
        try:
            result = self._make_request('complete_watering_command', {
                'p_command_id': command_id,
                'p_device_id': self.device_id,
                'p_success': success,
                'p_actual_amount': actual_amount,
                'p_error_message': error_message
            })
            
            if result.get('success'):
                logger.info(f"Command {command_id} completed (success: {success})")
                return True
            else:
                logger.error(f"Failed to complete command: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to complete command {command_id}: {e}")
            return False

    def water_plant(self, amount_ml: int) -> tuple[bool, Optional[str]]:
        """
        Physically water the plant
        
        Returns:
            (success: bool, error_message: Optional[str])
        """
        if self.is_watering:
            return False, "Device is already watering"
        
        if amount_ml > self.water_reservoir_ml:
            return False, f"Insufficient water in reservoir ({self.water_reservoir_ml}ml available)"
        
        if amount_ml <= 0 or amount_ml > 1000:
            return False, "Invalid water amount (must be 1-1000ml)"
        
        try:
            self.is_watering = True
            self.pump_status = 'running'
            self.current_activity = 'watering'
            
            logger.info(f"Starting to water {amount_ml}ml")
            
            # Calculate pump runtime (example: 1ml = 0.1 seconds)
            runtime_seconds = amount_ml * 0.1
            
            # Activate pump (mock implementation)
            self._activate_pump(runtime_seconds)
            
            # Update water reservoir level
            self.water_reservoir_ml -= amount_ml
            
            logger.info(f"Watering completed. Reservoir level: {self.water_reservoir_ml}ml")
            
            return True, None
            
        except Exception as e:
            error_msg = f"Watering failed: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
            
        finally:
            self.is_watering = False
            self.pump_status = 'idle'
            self.current_activity = 'idle'

    def _activate_pump(self, duration_seconds: float):
        """Activate the water pump for specified duration"""
        try:
            # Mock pump activation - replace with actual GPIO control
            logger.info(f"Pump ON for {duration_seconds} seconds")
            time.sleep(duration_seconds)
            logger.info("Pump OFF")
            
            # Example GPIO code (uncomment for actual hardware):
            # import RPi.GPIO as GPIO
            # GPIO.setmode(GPIO.BCM)
            # GPIO.setup(self.pump_gpio, GPIO.OUT)
            # GPIO.output(self.pump_gpio, GPIO.HIGH)
            # time.sleep(duration_seconds)
            # GPIO.output(self.pump_gpio, GPIO.LOW)
            
        except Exception as e:
            logger.error(f"Pump activation failed: {e}")
            raise

    def read_sensors(self) -> SensorReadings:
        """Read sensor values (mock implementation)"""
        try:
            # Mock sensor readings - replace with actual sensor code
            import random
            
            readings = SensorReadings(
                moisture=random.uniform(30, 80),
                temperature=random.uniform(18, 28),
                light=random.uniform(40, 95),
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            # Example actual sensor code:
            # moisture = self._read_moisture_sensor()
            # temperature = self._read_temperature_sensor()
            # light = self._read_light_sensor()
            
            self.last_sensor_reading = readings
            return readings
            
        except Exception as e:
            logger.error(f"Sensor reading failed: {e}")
            raise

    def update_device_status(self):
        """Update device status in Supabase"""
        try:
            # Read current sensor values
            sensor_readings = self.read_sensors()
            
            # Get WiFi signal strength (mock)
            wifi_signal = -45  # dBm
            
            # Get battery level (mock for battery-powered devices)
            battery_level = 85  # percentage
            
            result = self._make_request('update_device_status', {
                'p_device_id': self.device_id,
                'p_current_activity': self.current_activity,
                'p_water_reservoir_ml': self.water_reservoir_ml,
                'p_pump_status': self.pump_status,
                'p_sensor_readings': {
                    'moisture': sensor_readings.moisture,
                    'temperature': sensor_readings.temperature,
                    'light': sensor_readings.light,
                    'timestamp': sensor_readings.timestamp
                },
                'p_battery_percentage': battery_level,
                'p_wifi_signal_strength': wifi_signal,
                'p_error_codes': None  # Add any error codes if needed
            })
            
            if result.get('success'):
                logger.debug("Device status updated successfully")
            else:
                logger.warning("Failed to update device status")
                
        except Exception as e:
            logger.error(f"Failed to update device status: {e}")

    def process_command(self, command: WateringCommand):
        """Process a single watering command"""
        logger.info(f"Processing command {command.command_id}: {command.command_type} {command.water_amount}ml")
        
        # Acknowledge command receipt
        if not self.acknowledge_command(command.command_id):
            return
        
        # Execute the command based on type
        if command.command_type == 'water_now':
            success, error_message = self.water_plant(command.water_amount)
            actual_amount = command.water_amount if success else None
            
        elif command.command_type == 'stop_watering':
            # Implement emergency stop
            self.is_watering = False
            self.pump_status = 'idle'
            self.current_activity = 'idle'
            success = True
            error_message = None
            actual_amount = 0
            
        else:
            success = False
            error_message = f"Unknown command type: {command.command_type}"
            actual_amount = None
        
        # Report completion
        self.complete_command(command.command_id, success, actual_amount, error_message)

    def run(self):
        """Main device loop"""
        logger.info("Starting Blumentopf device main loop")
        
        while True:
            try:
                # Update device status (this also marks device as online)
                self.update_device_status()
                
                # Poll for new commands
                commands = self.poll_commands()
                
                # Process each command
                for command in commands:
                    self.process_command(command)
                
                # Wait before next iteration
                time.sleep(10)  # Poll every 10 seconds
                
            except KeyboardInterrupt:
                logger.info("Received shutdown signal")
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(30)  # Wait longer on error

def load_config() -> Dict[str, Any]:
    """Load device configuration from environment or config file"""
    config = {
        'device_id': os.getenv('BLUMENTOPF_DEVICE_ID', 'your-device-uuid-here'),
        'supabase_url': os.getenv('SUPABASE_URL', 'https://roufluqgmrwmdhrektcr.supabase.co'),
        'api_key': os.getenv('SUPABASE_ANON_KEY', 'your-anon-key-here'),
        'pump_gpio': int(os.getenv('PUMP_GPIO', '18')),
        'sensor_config': {
            'moisture_pin': int(os.getenv('MOISTURE_PIN', '21')),
            'temperature_pin': int(os.getenv('TEMPERATURE_PIN', '22')),
            'light_pin': int(os.getenv('LIGHT_PIN', '23'))
        }
    }
    
    # Validate required config
    if config['device_id'] == 'your-device-uuid-here':
        raise ValueError("Please set BLUMENTOPF_DEVICE_ID environment variable")
    
    if config['api_key'] == 'your-anon-key-here':
        raise ValueError("Please set SUPABASE_ANON_KEY environment variable")
    
    return config

if __name__ == "__main__":
    try:
        # Load configuration
        config = load_config()
        
        # Create and run device
        device = BlumentopfDevice(config)
        device.run()
        
    except Exception as e:
        logger.error(f"Failed to start device: {e}")
        exit(1)
