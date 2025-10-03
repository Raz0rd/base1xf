Write-Host "🧪 Testando webhook com dados EXATOS do BlackCat" -ForegroundColor Yellow

$json = @'
{
    "id": "20926644",
    "type": "transaction",
    "url": "https://www.garena-recargadigital.vip/api/webhook",
    "objectId": "20926644",
    "data": {
        "id": 20926644,
        "tenantId": "ccaca050-bd57-4c10-a050-55d7f8e492e6",
        "companyId": 18498,
        "amount": 1199,
        "currency": "BRL",
        "paymentMethod": "pix",
        "status": "waiting_payment",
        "installments": 1,
        "paidAt": null,
        "paidAmount": 0,
        "refundedAt": null,
        "refundedAmount": 0,
        "redirectUrl": null,
        "returnUrl": null,
        "postbackUrl": "https://www.garena-recargadigital.vip/api/webhook",
        "metadata": "{\"utmParams\":{\"src\":null,\"sck\":null,\"utm_source\":\"google\",\"utm_campaign\":\"22956871596\",\"utm_medium\":\"182499181377\",\"utm_content\":\"771788200935\",\"utm_term\":null,\"xcod\":null,\"keyword\":\"recarga diamante free fire\",\"device\":\"m\",\"network\":\"g\",\"gclid\":\"Cj0KCQjwwsrFBhD6ARIsAPnUFD3OZzxkdZykE1LyzoymIr8DfIwp2m0uDxiF3Ud5y8OJqNvwIHDiqN0aAlI6EALw_wcB\",\"gad_source\":\"1\",\"gbraid\":\"0AAAABBAMAH0FQ_ZcMGoP3ztOI1QIBToEQ\"}}",
        "ip": null,
        "externalRef": null,
        "secureId": "e73f3f44-fd03-457f-8cec-c8a261e93853",
        "secureUrl": "e73f3f44-fd03-457f-8cec-c8a261e93853",
        "createdAt": "2025-10-03T04:04:11.818Z",
        "updatedAt": "2025-10-03T04:04:11.818Z",
        "payer": null,
        "traceable": false,
        "authorizationCode": null,
        "basePrice": null,
        "interestRate": null,
        "items": [
            {
                "id": "recarga-free-fire",
                "name": "Recarga Free Fire",
                "quantity": 1,
                "price": 1199
            }
        ],
        "customer": {
            "id": 17305860,
            "name": "MARIA VANIEIDE LACERDA HENRIQUE CORREIA",
            "email": "marciobueno4777@gmail.com",
            "phone": "85981471273",
            "birthdate": null,
            "createdAt": "2025-09-06T14:51:53.194Z",
            "externalRef": null,
            "document": {
                "number": "12345678901",
                "type": "cpf"
            },
            "address": null
        },
        "fee": {
            "netAmount": 915,
            "estimatedFee": 283,
            "fixedAmount": 200,
            "spreadPercent": 699,
            "currency": "BRL"
        },
        "splits": [{}],
        "refunds": [],
        "pix": {
            "qrcode": "00020126860014br.gov.bcb.pix2564pix.ecomovi.com.br/qr/v3/at/90dfe4aa-029d-4f86-b5b3-8d7945f1ee205204000053039865802BR5925KAPTPAY_TECNOLOGIA_DE_PAG6009ARAPONGAS62070503***6304E5CC",
            "end2EndId": null,
            "receiptUrl": null,
            "expirationDate": "2025-10-05"
        },
        "boleto": null,
        "card": null,
        "refusedReason": null,
        "shipping": null,
        "delivery": null,
        "threeDS": null
    }
}
'@

Write-Host "📡 Testando /api/webhook..." -ForegroundColor Cyan
try {
    $response1 = Invoke-RestMethod -Uri "https://www.garena-recargadigital.vip/api/webhook" -Method POST -Body $json -ContentType "application/json" -Headers @{"User-Agent"="BlackCat-Webhook/1.0"}
    Write-Host "✅ /api/webhook - Status: SUCCESS" -ForegroundColor Green
    Write-Host "📄 Response: $($response1 | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ /api/webhook - Status: ERROR" -ForegroundColor Red
    Write-Host "📄 Error: $($_.Exception.Message)" -ForegroundColor White
    if ($_.Exception.Response) {
        Write-Host "📡 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📡 Testando /api/payment-webhook..." -ForegroundColor Cyan
try {
    $response2 = Invoke-RestMethod -Uri "https://www.garena-recargadigital.vip/api/payment-webhook" -Method POST -Body $json -ContentType "application/json" -Headers @{"User-Agent"="BlackCat-Webhook/1.0"}
    Write-Host "✅ /api/payment-webhook - Status: SUCCESS" -ForegroundColor Green
    Write-Host "📄 Response: $($response2 | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ /api/payment-webhook - Status: ERROR" -ForegroundColor Red
    Write-Host "📄 Error: $($_.Exception.Message)" -ForegroundColor White
    if ($_.Exception.Response) {
        Write-Host "📡 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 Teste concluído!" -ForegroundColor Yellow
