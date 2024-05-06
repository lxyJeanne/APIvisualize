import json

# 假设原始 JSON 数据已经被解析到一个变量 data 中
data = {
    "alarmData": "{\"CIDEvent\":{\"channelSerial\":\"\",\"code\":1103,\"description\":\"alarmTrig\",\"deviceNo\":10,\"evttype\":\"11\",\"ipcChannel\":0,\"isTalk\":0,\"system\":3,\"zone\":6,\"zoneName\":\"Wireless Zone 7\"},\"deviceSerial\":\"Q26344467\",\"eventDescription\":\"CID event\",\"eventType\":\"cidEvent\",\"triggerTime\":\"2024-05-03T11:26:44\"}",
    "deviceSerial": "Q26344467",
    "formatType": "JSON"
}

# 解析 alarmData 字符串
alarm_data = json.loads(data['alarmData'])

# 现在 alarm_data 是一个字典，可以访问其内部的字段
cid_event = alarm_data.get('CIDEvent', {})
print(cid_event)
description = cid_event.get('description', '')
print(description)

