import requests
import json

def test_university():
    try:
        # 1. Search University
        url = "https://univppdikti.vercel.app/search/university/gunadarma"
        print(f"Fetching {url}...")
        res = requests.get(url)
        data = res.json()
        
        # Handle various response formats
        results = []
        if isinstance(data, list):
            results = data
        elif isinstance(data, dict) and 'data' in data:
            results = data['data']
        
        if results and len(results) > 0:
            first_result = results[0]
            print("First Result:", json.dumps(first_result, indent=2))
            
            id = first_result.get('id')
            if id:
                # 2. Detail University
                detail_url = f"https://univppdikti.vercel.app/detail/university/{id}"
                print(f"\nFetching Detail: {detail_url}...")
                detail_res = requests.get(detail_url)
                detail_data = detail_res.json()
                print("Detail Response:")
                print(json.dumps(detail_data, indent=2))
            else:
                print("No ID found in search result.")
        else:
            print("No university found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_university()
