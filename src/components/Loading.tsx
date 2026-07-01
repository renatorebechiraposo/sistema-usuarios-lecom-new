import { Flex, Spin } from "antd";

export default function Loading() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    >
      <Spin size="large" />
    </Flex>
  );
}
