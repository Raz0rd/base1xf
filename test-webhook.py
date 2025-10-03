#!/usr/bin/env python3
import requests
import json
import sys

def test_webhook():
    print("🧪 Testando webhook com dados EXATOS do BlackCat")
    
    # Dados EXATOS que o BlackCat envia
    webhook_data = {
        "id": "20927053",
        "type": "transaction",
        "url": "https://www.garena-recargadigital.vip/api/webhook",
        "objectId": "20927053",
        "data": {
            "id": 20927053,
            "tenantId": "ccaca050-bd57-4c10-a050-55d7f8e492e6",
            "companyId": 18498,
            "amount": 1199,
            "currency": "BRL",
            "paymentMethod": "pix",
            "status": "waiting_payment",
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
            "secureId": "e73f3f44-fd03-457f-8cec-c8a261e93853",
            "secureUrl": "e73f3f44-fd03-457f-8cec-c8a261e93853",
            "createdAt": "2025-10-03T04:04:11.818Z",
            "updatedAt": "2025-10-03T04:04:11.818Z",
            "payer": None,
            "traceable": False,
            "authorizationCode": None,
            "basePrice": None,
            "interestRate": None,
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
                "birthdate": None,
                "createdAt": "2025-09-06T14:51:53.194Z",
                "externalRef": None,
                "document": {
                    "number": "12345678901",
                    "type": "cpf"
                },
                "address": None
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
    
    # Lista de rotas para testar
    routes = [
        "/api/webhook",
        "/api/payment-webhook"
    ]
    
    base_url = "https://www.garena-recargadigital.vip"
    
    for route in routes:
        url = f"{base_url}{route}"
        print(f"\n📡 Testando {route}...")
        print(f"🔗 URL: {url}")
        
        try:
            response = requests.post(
                url,
                json=webhook_data,
                headers=headers,
                timeout=30
            )
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"⏱️  Response Time: {response.elapsed.total_seconds():.2f}s")
            print(f"📏 Response Size: {len(response.content)} bytes")
            
            # Headers da resposta
            print("📋 Response Headers:")
            for key, value in response.headers.items():
                print(f"   {key}: {value}")
            
            # Conteúdo da resposta
            print("📄 Response Body:")
            try:
                response_json = response.json()
                print(json.dumps(response_json, indent=2, ensure_ascii=False))
            except:
                print(f"   Raw text: {response.text}")
            
            if response.status_code == 200:
                print(f"✅ {route} - SUCCESS")
            else:
                print(f"❌ {route} - ERROR (Status: {response.status_code})")
                
        except requests.exceptions.Timeout:
            print(f"⏰ {route} - TIMEOUT (30s)")
        except requests.exceptions.ConnectionError:
            print(f"🔌 {route} - CONNECTION ERROR")
        except requests.exceptions.RequestException as e:
            print(f"❌ {route} - REQUEST ERROR: {str(e)}")
        except Exception as e:
            print(f"💥 {route} - UNEXPECTED ERROR: {str(e)}")
        
        print("-" * 80)
    
    print("\n🎯 Teste concluído!")

if __name__ == "__main__":
    test_webhook()
