import requests
import json

def test_api():
    try:
        # 1. Search
        url = "https://univppdikti.vercel.app/search/mahasiswa/Raynaldo"
        print(f"Fetching {url}...")
        response = requests.get(url)
        data = response.json()
        
        if data and len(data) > 0:
            first_result = data[0]
            print("First Result:")
            print(json.dumps(first_result, indent=2))
            
            # 2. Get Detail
            if 'id' in first_result:
                detail_url = f"https://univppdikti.vercel.app/detail/mahasiswa/{first_result['id']}"
                print(f"\nFetching Detail: {detail_url}...")
                detail_res = requests.get(detail_url)
                detail_data = detail_res.json()
                print("Detail Data:")
                print(json.dumps(detail_data, indent=2))
        else:
            print("No results found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
