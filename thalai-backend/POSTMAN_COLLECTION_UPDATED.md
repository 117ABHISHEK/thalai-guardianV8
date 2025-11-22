# Updated Postman Collection - Modules 4-7

## New Endpoints

### Module 4: Donor Matching

#### Find Matches
```
POST {{base_url}}/match/find
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "requestId": "request_id_here"
}
```

#### Get Top Matches
```
GET {{base_url}}/match/top?requestId=request_id
Authorization: Bearer {{token}}
```

### Module 5: e-RaktKosh Integration

#### Search e-RaktKosh
```
GET {{base_url}}/external/eraktkosh/search?bloodGroup=O+&city=Mumbai&state=Maharashtra
Authorization: Bearer {{token}}
```

#### Merge Sources
```
POST {{base_url}}/external/merge
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "requestId": "request_id_here"
}
```

### Module 6: Chatbot

#### Ask Chatbot
```
POST {{base_url}}/chatbot/ask
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "message": "What is the transfusion schedule?",
  "sessionId": "optional_session_id"
}
```

#### Get Chat History
```
GET {{base_url}}/chatbot/history?sessionId=session_id&limit=50
Authorization: Bearer {{token}}
```

### Module 7: Notifications

#### Send Notification (Admin)
```
POST {{base_url}}/notifications/send
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userId": "user_id",
  "type": "donor_match",
  "title": "New Match Found",
  "message": "A donor match has been found for your request",
  "channel": "sms",
  "metadata": {
    "requestId": "request_id"
  }
}
```

#### Get Notifications
```
GET {{base_url}}/notifications?status=sent&type=donor_match&limit=50
Authorization: Bearer {{token}}
```

#### Mark as Read
```
PUT {{base_url}}/notifications/:id/read
Authorization: Bearer {{token}}
```

## AI Service Endpoints

### Health Check
```
GET http://localhost:5001/health
```

### Predict Availability
```
POST http://localhost:5001/predict-availability
Content-Type: application/json

{
  "donorId": "donor_id",
  "age": 30,
  "donationFrequency": 5,
  "lastDonationDate": "2024-01-15",
  "region": "north",
  "healthFlags": []
}
```

## Testing Workflow

1. **Create Request** → Get requestId
2. **Find Matches** → Get matched donors
3. **View Match Results** → Check scores
4. **Test Chatbot** → Ask questions
5. **Check Notifications** → Verify SMS sent
6. **Search External** → Test e-RaktKosh

