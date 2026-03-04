import { Spin } from "antd";

const PageLoader = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

export default PageLoader;
