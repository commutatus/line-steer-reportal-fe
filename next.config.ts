import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "antd",
    "@rc-component/util",
    "rc-util",
    "rc-input",
    "rc-textarea",
    "rc-picker",
    "rc-pagination",
    "rc-tree",
    "rc-table",
    "@ant-design/icons-svg",
  ],
};

export default nextConfig;
