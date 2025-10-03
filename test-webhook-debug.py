#!/usr/bin/env python3
import requests
import json

def test_webhook_debug():
    print("🧪 Testando webhook com ID REAL: 20927763")
    
    # Dados com ID REAL que você gerou
    webhook_data = {
        "id": "20927763",
        "type": "transaction", 
        "url": "https://www.garena-recargadigital.vip/api/webhook",
        "objectId": "20927763",
        "data": {
            "id": 20927763,
            "tenantId": "ccaca050-bd57-4c10-a050-55d7f8e492e6",
            "companyId": 18498,
            "amount": 1999,  # R$ 19,99 em centavos
            "currency": "BRL",
            "paymentMethod": "pix",
            "status": "waiting_payment",  # Status correto
            "installments": 1,
            "paidAt": None,
            "paidAmount": 0,
            "refundedAt": None,
            "refundedAmount": 0,
            "redirectUrl": None,
            "returnUrl": None,
            "postbackUrl": "https://www.garena-recargadigital.vip/api/webhook",
            "metadata": '{"utmParams":{"src":null,"sck":null,"utm_source":"google","utm_campaign":"22956871596","utm_medium":"182499181377","utm_content":"771788200935","utm_term":null,"xcod":null,"keyword":"recarga diamante free fire","device":"m","network":"g","gclid":"Cj0KCQjwwsrFBhD6ARIsAPnUFD3OZzxkdZykE1LyzoymIr8DfIwp2m0uDxiF3Ud5y8OJqNvwIHDiqN0aAlI6EALw_wcB","gad_source":"1","gbraid":"0AAAABBAMAH0FQ_ZcMGoP3ztOI1QIBToEQ"}}',
            "ip": None,
            "externalRef": None,
            "secureId": "493280cb-53d1-4797-8cfc-0592b0362cf6",
            "secureUrl": "493280cb-53d1-4797-8cfc-0592b0362cf6",
            "createdAt": "2025-10-03T04:34:03.624Z",
            "updatedAt": "2025-10-03T04:34:03.624Z",
            "payer": None,
            "traceable": False,
            "authorizationCode": None,
            "basePrice": None,
            "interestRate": None,
            "items": [
                {
                    "title": "Recarga",
                    "quantity": 1,
                    "tangible": False,
                    "unitPrice": 1999,
                    "externalRef": ""
                }
            ],
            "customer": {
                "id": 12793801,
                "name": "Libridia Gomares Difunabes",
                "email": "ddswds@gmail.com",
                "phone": "37999822783",
                "birthdate": None,
                "createdAt": "2025-08-04T04:06:52.174Z",
                "externalRef": None,
                "document": {
                    "type": "cpf",
                    "number": "07154520370"
                },
                "address": None
            },
            "fee": {
                "netAmount": 1659,
                "estimatedFee": 339,
                "fixedAmount": 200,
                "spreadPercent": 699,
                "currency": "BRL"
            },
            "splits": [
                {
                    "amount": 1999,
                    "netAmount": 1659,
                    "recipientId": 18498,
                    "chargeProcessingFee": False
                }
            ],
            "refunds": [],
            "pix": {
                "qrcode": "00020126860014br.gov.bcb.pix2564pix.ecomovi.com.br/qr/v3/at/e20a192a-7882-42c8-9a8a-13752e9588685204000053039865802BR5925KAPTPAY_TECNOLOGIA_DE_PAG6009ARAPONGAS62070503***630443C8",
                "end2EndId": None,
                "receiptUrl": None,
                "expirationDate": "2025-10-05"
            },
            "boleto": None,
            "card": None,
            "refusedReason": None,
            "shipping": None,
            "delivery": None,
            "threeDS": None
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "BlackCat-Webhook/1.0"
    }
    
    url = "https://www.garena-recargadigital.vip/api/webhook"
    
    print(f"📡 Enviando para: {url}")
    print(f"📦 Transaction ID: {webhook_data['data']['id']}")
    print(f"📊 Status: {webhook_data['data']['status']}")
    print(f"💰 Amount: {webhook_data['data']['amount']}")
    print(f"👤 Customer: {webhook_data['data']['customer']['name']}")
    
    try:
        response = requests.post(url, json=webhook_data, headers=headers, timeout=30)
        
        print(f"\n📊 Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {response.elapsed.total_seconds():.2f}s")
        
        try:
            response_json = response.json()
            print("📄 Response JSON:")
            print(json.dumps(response_json, indent=2, ensure_ascii=False))
        except:
            print(f"📄 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook SUCCESS")
            print("\n🔍 VERIFICAÇÕES NECESSÁRIAS:")
            print("1. Verifique os logs do Netlify para ver se apareceram:")
            print("   - [v0] 🚨 DEBUG: isPaid=false, isWaitingPayment=true")
            print("   - [v0] 🚨 DEBUG UTMify: ENABLED=true")
            print("   - [v0] ✅ Successfully sent payment pending to UTMify")
            print("\n2. Se NÃO apareceram esses logs, há problema no código")
            print("3. Se apareceram mas UTMify não recebeu, há problema na API UTMify")
        else:
            print(f"❌ Webhook ERROR: {response.status_code}")
            
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")

if __name__ == "__main__":
    test_webhook_debug()
