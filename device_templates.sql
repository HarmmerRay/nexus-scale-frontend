-- 设备模板插入SQL语句
-- 为每种传感器类型创建对应的数据模板

-- 清空已有数据（可选）
-- DELETE FROM device_template;

-- 插入设备模板数据
INSERT INTO device_template (show_name, en_name, template, mac_pre) VALUES
('温度传感器', 'temperature', '{"temperature": {"unit": "°C", "range": "-40~85", "accuracy": "±0.1"}}', 'TP'),
('湿度传感器', 'humidity', '{"humidity": {"unit": "%RH", "range": "0~100", "accuracy": "±2%"}}', 'HM'),
('空气成分传感器', 'air_component', '{"co2": {"unit": "ppm", "range": "400~5000"}, "o2": {"unit": "%", "range": "0~25"}, "pm25": {"unit": "μg/m³", "range": "0~500"}}', 'AC'),
('土壤氮磷钾传感器', 'soil_NPK', '{"nitrogen": {"unit": "mg/kg", "range": "0~1999"}, "phosphorus": {"unit": "mg/kg", "range": "0~1999"}, "potassium": {"unit": "mg/kg", "range": "0~1999"}}', 'NPK'),
('PH值传感器', 'soil_PH', '{"ph": {"unit": "pH", "range": "3~9", "accuracy": "±0.1"}}', 'PH'),
('微量元素传感器', 'soil_trace_elements', '{"iron": {"unit": "mg/kg", "range": "0~200"}, "zinc": {"unit": "mg/kg", "range": "0~50"}, "copper": {"unit": "mg/kg", "range": "0~25"}, "manganese": {"unit": "mg/kg", "range": "0~100"}}', 'TE'),
('风速传感器', 'wind_speed', '{"wind_speed": {"unit": "m/s", "range": "0~60", "accuracy": "±0.5"}}', 'WS'),
('风向传感器', 'wind_direction', '{"wind_direction": {"unit": "°", "range": "0~360", "accuracy": "±3°"}}', 'WD'),
('光照强度传感器', 'light_intensity', '{"illuminance": {"unit": "lux", "range": "0~200000", "accuracy": "±5%"}}', 'LI');

-- 查看插入结果
SELECT * FROM device_template ORDER BY dt_id;
