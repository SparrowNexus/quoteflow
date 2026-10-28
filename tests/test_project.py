from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ProjectStructureTests(unittest.TestCase):
    def test_vite_and_react_configuration_exists(self):
        pkg = json.loads((ROOT / "package.json").read_text())
        self.assertIn("react", pkg["dependencies"])
        self.assertIn("vite", pkg["dependencies"])
        self.assertEqual(pkg["scripts"]["build"], "vite build")

    def test_vercel_has_api_and_spa_rewrite(self):
        cfg = json.loads((ROOT / "vercel.json").read_text())
        self.assertIn("api/enquiry.js", cfg["functions"])
        self.assertEqual(cfg["rewrites"][0]["destination"], "/index.html")

    def test_all_original_content_pages_are_present(self):
        expected = ["index", "features", "how-it-works", "solutions", "about", "contact",
                    "terms", "privacy", "software-license", "refunds",
                    "intellectual-property", "customer-exit", "security",
                    "accessibility", "login-unavailable", "404"]
        for page in expected:
            with self.subTest(page=page):
                self.assertTrue((ROOT / "public" / "pages" / f"{page}.html").is_file())

    def test_original_design_assets_are_present(self):
        for asset in ["site.css", "site.js", "quoteflow-logo.png", "app-interface-reference.png", "favicon.svg"]:
            with self.subTest(asset=asset):
                self.assertTrue((ROOT / "public" / "assets" / asset).is_file())

    def test_enquiry_function_and_react_entry_exist(self):
        self.assertIn("export default async function handler", (ROOT / "api/enquiry.js").read_text())
        self.assertTrue((ROOT / "src/main.jsx").is_file())
        self.assertTrue((ROOT / "index.html").is_file())

if __name__ == "__main__":
    unittest.main()
