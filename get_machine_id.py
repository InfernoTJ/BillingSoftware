#!/usr/bin/env python3
"""
get_machine_id.py

Cross-platform helper to generate a machine-unique ID by hashing
several system identifiers (MAC, OS info, disk/serial when available).

Returns: lowercase hex SHA-256 string (64 chars).
"""

import hashlib
import uuid
import platform
import subprocess
import re
from typing import List


def run_cmd(cmd: List[str]) -> str:
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, universal_newlines=True, timeout=3)
        return out.strip()
    except Exception:
        return ""


def get_mac_addresses() -> str:
    # uuid.getnode() is the hardware MAC (or a random one if it couldn't find real).
    try:
        mac = uuid.getnode()
        if (mac >> 40) % 2:  # if multicast bit set, it's not a real MAC
            return ""
        return ":".join(f"{(mac >> ele) & 0xff:02x}" for ele in range(40, -1, -8))
    except Exception:
        return ""


def get_windows_disk_serial() -> str:
    out = run_cmd(["wmic", "diskdrive", "get", "SerialNumber"])
    # output includes header; try to find a serial-like token
    if not out:
        return ""
    lines = [l.strip() for l in out.splitlines() if l.strip() and "SerialNumber" not in l]
    return lines[0] if lines else ""


def get_linux_disk_serial() -> str:
    # try lsblk with serial column
    out = run_cmd(["lsblk", "-o", "NAME,SERIAL", "-J"])
    if out:
        # crude extraction of SERIAL text
        serials = re.findall(r'"serial":\s*"([^"]+)"', out, re.IGNORECASE)
        if serials:
            return serials[0]
    # fallback: try udevadm for first disk
    out2 = run_cmd(["udevadm", "info", "--query=property", "--name=/dev/sda"])
    if out2:
        m = re.search(r'ID_SERIAL_SHORT=(.+)', out2)
        if m:
            return m.group(1).strip()
    return ""


def get_macos_serial() -> str:
    # system_profiler returns a lot; grep the "Serial Number (system)"
    out = run_cmd(["system_profiler", "SPHardwareDataType"])
    if out:
        m = re.search(r"Serial Number.*:\s*(\S+)", out)
        if m:
            return m.group(1).strip()
    return ""


def get_cpu_info() -> str:
    try:
        return platform.processor() or platform.machine() or ""
    except Exception:
        return ""


def get_platform_info() -> str:
    try:
        return f"{platform.system()}|{platform.release()}|{platform.version()}"
    except Exception:
        return ""


def get_machine_id() -> str:
    pieces = []

    # 1) MAC
    mac = get_mac_addresses()
    if mac:
        pieces.append(f"MAC:{mac}")

    # 2) platform / cpu
    cpu = get_cpu_info()
    if cpu:
        pieces.append(f"CPU:{cpu}")
    pieces.append(f"PLAT:{get_platform_info()}")

    # 3) OS-specific disk/serial
    sysname = platform.system().lower()
    serial = ""
    if sysname == "windows":
        serial = get_windows_disk_serial()
    elif sysname == "darwin":
        serial = get_macos_serial()
    elif sysname == "linux":
        serial = get_linux_disk_serial()

    if serial:
        pieces.append(f"DISK:{serial}")

    # 4) fallback hostname
    try:
        hostname = platform.node()
        if hostname:
            pieces.append(f"HN:{hostname}")
    except Exception:
        pass

    # join and hash
    concat = "|".join(pieces)
    if not concat:
        # absolute fallback: random but stable per session (shouldn't happen)
        concat = "fallback-" + str(uuid.getnode())

    h = hashlib.sha256(concat.encode("utf-8")).hexdigest()
    return h


if __name__ == "__main__": 
    print(get_machine_id())


