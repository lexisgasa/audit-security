#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
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

const DANGEROUS_SCRIPTS = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
  "prepack",
];

async function analyzeRoot(pkgPath) {
  try {
    const data = await fs.readFile(pkgPath, "utf8");
    const pkgFile = JSON.parse(data);
    const scripts = pkgFile.scripts || {};

    return DANGEROUS_SCRIPTS.filter((script) => scripts[script]);
  } catch (error) {
    throw new Error("PACKAGE_JSON_NOT_FOUND");
  }
}

async function analyzeLockfile(lockPath) {
  try {
    const data = await fs.readFile(lockPath, "utf8");
    const lockfile = JSON.parse(data);
    const packages = lockfile.packages || {};

    const suspiciousPackages = new Set();

    for (const [pkg, data] of Object.entries(packages)) {
      if (data.hasInstallScript) {
        const cleanName = pkg.split("node_modules/").pop();
        if (cleanName) suspiciousPackages.add(cleanName);
      }
    }

    const suspiciousArray = Array.from(suspiciousPackages);
    return {
      threats: suspiciousArray.filter((pkg) => !allowList.includes(pkg)),
      safe: suspiciousArray.filter((pkg) => allowList.includes(pkg)),
    };
  } catch (error) {
    throw new Error("LOCKFILE_NOT_FOUND");
  }
}

async function checkRepoSanity() {
  const cwd = process.cwd();
  let isRootCompromised = false;
  let hasThreats = false;

  console.log(
    `${colors.dim}🔍 Starting security audit in ${cwd}...${colors.reset}\n`,
  );

  // 1. CHECK ROOT PACKAGE.JSON
  try {
    const foundRootScripts = await analyzeRoot(path.join(cwd, "package.json"));

    if (foundRootScripts.length > 0) {
      isRootCompromised = true;
      console.log(
        `${colors.red}${colors.bold}🔴 [CRITICAL DANGER] The root 'package.json' contains malicious installation scripts!${colors.reset}`,
      );
      foundRootScripts.forEach((script) => {
        console.log(`${colors.red}   🚨 ${script}${colors.reset}`);
      });
    } else {
      console.log(
        `${colors.green}🟢 [ROOT SAFE] Root 'package.json' has no hidden install scripts.${colors.reset}`,
      );
    }
  } catch (e) {
    console.log(
      `${colors.red}🔴 Error: 'package.json' not found. Are you in the right directory?${colors.reset}`,
    );
    return; // Exit if no package.json is found
  }

  // 2. CHECK PACKAGE-LOCK.JSON (DEPENDENCIES)
  try {
    const { threats, safe } = await analyzeLockfile(
      path.join(cwd, "package-lock.json"),
    );

    if (threats.length === 0) {
      console.log(
        `${colors.green}🟢 [DEPS SAFE] All dependencies are clean.${colors.reset}`,
      );
    } else {
      hasThreats = true;
      console.log(
        `\n${colors.red}${colors.bold}🔴 [DANGER] UNKNOWN dependencies attempting to execute code found:${colors.reset}`,
      );
      threats.forEach((pkg) =>
        console.log(`${colors.red}   🚨 ${pkg}${colors.reset}`),
      );
    }

    if (safe.length > 0) {
      console.log(
        `\n${colors.dim}⚪ [INFO] Allowed packages detected (safe to compile):${colors.reset}`,
      );
      safe.forEach((pkg) =>
        console.log(`${colors.dim}   - ${pkg}${colors.reset}`),
      );
    }
  } catch (e) {
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

  // 3. FINAL VERDICT
  if (isRootCompromised || hasThreats) {
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
}

checkRepoSanity();
