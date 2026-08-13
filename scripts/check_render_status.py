#!/usr/bin/env python3
"""
🔍 Render Status Monitor
Checks Render services status and reports via GitHub
"""

import os
import sys
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional

class RenderStatusMonitor:
    """Monitor Render services and report status"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.render.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.timestamp = datetime.utcnow().isoformat()

    def get_services(self) -> Optional[List[Dict]]:
        """Get all services from Render"""
        try:
            response = requests.get(
                f"{self.base_url}/services",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return data.get("services", [])
        except Exception as e:
            print(f"❌ Error fetching services: {e}")
            return None

    def get_service_status(self, service_id: str) -> Optional[Dict]:
        """Get detailed status of a service"""
        try:
            response = requests.get(
                f"{self.base_url}/services/{service_id}",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error fetching service {service_id}: {e}")
            return None

    def format_status_report(self, services: List[Dict]) -> str:
        """Format services status as markdown"""
        report = f"# 🔍 Render Status Report\n\n**Time:** {self.timestamp}\n\n"

        if not services:
            report += "❌ No services found\n"
            return report

        # Group by status
        running = []
        suspended = []
        deploying = []
        failed = []

        for service in services:
            status = service.get("status", "unknown")
            name = service.get("name", "Unknown")
            service_id = service.get("id", "N/A")

            service_info = {
                "name": name,
                "id": service_id,
                "type": service.get("type", "unknown"),
                "region": service.get("region", "N/A"),
                "status": status
            }

            if status == "live":
                running.append(service_info)
            elif status == "suspended":
                suspended.append(service_info)
            elif status == "deploying":
                deploying.append(service_info)
            elif status == "update_failed":
                failed.append(service_info)

        # Report running services
        if running:
            report += "## ✅ Running Services\n\n"
            for svc in running:
                report += f"- **{svc['name']}** ({svc['type']})\n"
                report += f"  - Region: {svc['region']}\n"
                report += f"  - Status: {svc['status']}\n\n"

        # Report deploying services
        if deploying:
            report += "## 🔄 Deploying Services\n\n"
            for svc in deploying:
                report += f"- **{svc['name']}** ({svc['type']})\n"
                report += f"  - Status: {svc['status']}\n\n"

        # Report suspended services
        if suspended:
            report += "## 🟡 Suspended Services\n\n"
            for svc in suspended:
                report += f"- **{svc['name']}** ({svc['type']})\n"
                report += f"  - Status: {svc['status']}\n\n"

        # Report failed services
        if failed:
            report += "## ❌ Failed Services\n\n"
            for svc in failed:
                report += f"- **{svc['name']}** ({svc['type']})\n"
                report += f"  - Status: {svc['status']}\n\n"

        # Summary
        report += "## 📊 Summary\n\n"
        report += f"- ✅ Running: {len(running)}\n"
        report += f"- 🔄 Deploying: {len(deploying)}\n"
        report += f"- 🟡 Suspended: {len(suspended)}\n"
        report += f"- ❌ Failed: {len(failed)}\n"

        return report

    def get_usage(self) -> Optional[Dict]:
        """Get usage information (compute minutes, disk, bandwidth)"""
        try:
            response = requests.get(
                f"{self.base_url}/usage",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error fetching usage: {e}")
            return None

    def check_all(self) -> Dict:
        """Check everything and return report"""
        result = {
            "timestamp": self.timestamp,
            "services": [],
            "usage": None,
            "all_healthy": True,
            "report": ""
        }

        # Get services
        services = self.get_services()
        if services:
            result["services"] = services
            result["report"] = self.format_status_report(services)

            # Check if all are running
            for svc in services:
                if svc.get("status") != "live":
                    result["all_healthy"] = False
        else:
            result["all_healthy"] = False
            result["report"] = "❌ Could not fetch services\n"

        # Get usage
        usage = self.get_usage()
        if usage:
            result["usage"] = usage

        return result


def main():
    """Main entry point"""
    api_key = os.getenv("RENDER_API_KEY")
    if not api_key:
        print("❌ Error: RENDER_API_KEY environment variable not set")
        sys.exit(1)

    monitor = RenderStatusMonitor(api_key)
    result = monitor.check_all()

    # Print report
    print(result["report"])

    # Save JSON report
    report_file = "render_status.json"
    with open(report_file, "w") as f:
        json.dump(result, f, indent=2)
    print(f"\n📁 Report saved to: {report_file}")

    # Exit with appropriate code
    sys.exit(0 if result["all_healthy"] else 1)


if __name__ == "__main__":
    main()
