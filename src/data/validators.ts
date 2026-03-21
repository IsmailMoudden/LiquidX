import { Validator } from "@/lib/types";

export const VALIDATORS: Validator[] = [
  {
    id: "validator-001",
    name: "Marcus Rein",
    organization: "Swiss Property Settlement AG",
    feePercentage: 1.0,
    xrplAddress: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    approvedCount: 47,
    totalVolumeSettled: 142_000_000,
    status: "active",
  },
  {
    id: "validator-002",
    name: "Elena Vasquez",
    organization: "EuroRWA Compliance Bureau",
    feePercentage: 0.75,
    xrplAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    approvedCount: 23,
    totalVolumeSettled: 58_500_000,
    status: "active",
  },
];
