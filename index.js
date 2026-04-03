#!/usr/bin/env node

const fs = require("fs");
const allowList = require("./allowList.js");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
};

function checkRepoSanity() {
  let isRootCompromised = false;

  // 1. CHECK ROOT PACKAGE.JSON
  try {
    const pkgFile = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const scripts = pkgFile.scripts || {};
    const dangerousScripts = ["preinstall", "install", "postinstall"];

    const foundRootScripts = dangerousScripts.filter(
      (script) => scripts[script],
    );

    if (foundRootScripts.length > 0) {
      isRootCompromised = true;
      console.log(
        `${colors.red}${colors.bold}🔴 [CRITICAL DANGER] The root 'package.json' contains malicious installation scripts!${colors.reset}`,
      );
      foundRootScripts.forEach((script) => {
        console.log(
          `${colors.red}   🚨 ${script}: "${scripts[script]}"${colors.reset}`,
        );
      });
      console.log("");
    } else {
      console.log(
        `${colors.green}🟢 [ROOT SAFE] Root 'package.json' has no hidden install scripts.${colors.reset}`,
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}🔴 Error: 'package.json' not found. Are you in the right directory?${colors.reset}`,
    );
    return; // Exit if not even package.json exists
  }

  // 2. CHECK PACKAGE-LOCK.JSON (DEPENDENCIES)
  try {
    const lockfile = JSON.parse(fs.readFileSync("./package-lock.json", "utf8"));
    const packages = lockfile.packages || {};
    let suspiciousPackages = [];

    // Parse lockfile
    for (const [pkg, data] of Object.entries(packages)) {
      if (data.hasInstallScript) {
        const cleanName = pkg.split("node_modules/").pop();
        if (cleanName && !suspiciousPackages.includes(cleanName)) {
          suspiciousPackages.push(cleanName);
        }
      }
    }

    // Evaluate threats
    const unknownThreats = suspiciousPackages.filter(
      (pkg) => !allowList.includes(pkg),
    );
    const knownSafe = suspiciousPackages.filter((pkg) =>
      allowList.includes(pkg),
    );

    // Print Results
    if (unknownThreats.length === 0) {
      console.log(
        `${colors.green}🟢 [DEPS SAFE] All dependencies are clean.${colors.reset}`,
      );
    } else {
      console.log(
        `\n${colors.red}${colors.bold}🔴 [DANGER] UNKNOWN dependencies attempting to execute code found:${colors.reset}`,
      );
      unknownThreats.forEach((pkg) =>
        console.log(`${colors.red}   🚨 ${pkg}${colors.reset}`),
      );
    }

    if (knownSafe.length > 0) {
      console.log(
        `\n${colors.dim}⚪ [INFO] Allowed packages detected (safe to compile):${colors.reset}`,
      );
      knownSafe.forEach((pkg) =>
        console.log(`${colors.dim}   - ${pkg}${colors.reset}`),
      );
    }

    // FINAL VERDICT
    if (isRootCompromised || unknownThreats.length > 0) {
      console.log(
        `\n💡 ${colors.yellow}${colors.bold}VERDICT: DO NOT RUN 'npm install'.${colors.reset}`,
      );
      console.log(
        `${colors.yellow}If you must proceed, strictly use: ${colors.cyan}npm ci --ignore-scripts${colors.reset}`,
      );
    } else {
      console.log(
        `\n✅ ${colors.green}${colors.bold}VERDICT: Safe to run 'npm install'.${colors.reset}`,
      );
    }
  } catch (error) {
    console.log(
      `\n${colors.yellow}⚠️  [WARNING] 'package-lock.json' not found.${colors.reset}`,
    );
    console.log(
      `${colors.dim}This is common if the author didn't commit it to Git.${colors.reset}`,
    );
    console.log(`To safely generate it and run this audit again, type:`);
    console.log(
      `${colors.cyan}npm install --package-lock-only --ignore-scripts${colors.reset}`,
    );
  }
}

checkRepoSanity();
