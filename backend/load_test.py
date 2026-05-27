import urllib.request
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def send_prediction_request(url, expected_marks):
    data = json.dumps({
        "expected_marks": expected_marks,
        "category": "General",
        "interests": ["Computer Science"]
    }).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = response.read()
            duration = time.time() - start_time
            if response.status == 200:
                return True, duration
            else:
                return False, duration
    except Exception as e:
        duration = time.time() - start_time
        return False, duration

def run_load_test(total_requests=50, max_workers=10):
    url = "http://localhost:8000/api/predictions/rank/"
    print(f"Starting Load Test on {url}...")
    print(f"Simulating {total_requests} requests with concurrency of {max_workers}...\n")
    
    latencies = []
    success_count = 0
    failure_count = 0
    
    start_total = time.time()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(send_prediction_request, url, 100 + (i % 200)): i
            for i in range(total_requests)
        }
        
        for future in as_completed(futures):
            success, duration = future.result()
            latencies.append(duration)
            if success:
                success_count += 1
            else:
                failure_count += 1
                
    end_total = time.time()
    total_duration = end_total - start_total
    
    if latencies:
        avg_latency = sum(latencies) / len(latencies)
        min_latency = min(latencies)
        max_latency = max(latencies)
        latencies.sort()
        p95_latency = latencies[int(len(latencies) * 0.95)]
    else:
        avg_latency = min_latency = max_latency = p95_latency = 0
        
    print("=" * 45)
    print("                LOAD TEST SUMMARY")
    print("=" * 45)
    print(f"Total Requests Sent: {total_requests}")
    print(f"Successful Requests: {success_count} ({(success_count/total_requests)*100:.1f}%)")
    print(f"Failed Requests:     {failure_count} ({(failure_count/total_requests)*100:.1f}%)")
    print(f"Total Test Time:     {total_duration:.3f} seconds")
    print(f"Throughput:          {total_requests/total_duration:.2f} req/sec")
    print("-" * 45)
    print(f"Min Latency:         {min_latency*1000:.1f} ms")
    print(f"Avg Latency:         {avg_latency*1000:.1f} ms")
    print(f"P95 Latency:         {p95_latency*1000:.1f} ms")
    print(f"Max Latency:         {max_latency*1000:.1f} ms")
    print("=" * 45)

if __name__ == "__main__":
    run_load_test()
