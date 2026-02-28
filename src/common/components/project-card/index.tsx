// Rename this card component as per your project/design card name
"use client";

import { HeartOutlined } from "@ant-design/icons";
import { Button, Card, Typography } from "antd";
import Image from "next/image";
import React from "react";

const { Title, Text } = Typography;

type ProjectCardPropsType = {
  projectCardData: {
    title: string;
    description: string;
    image: string;
  };
};

const ProjectCard = (props: ProjectCardPropsType) => {
  const { projectCardData } = props;
  return (
    <Card
      hoverable
      cover={
        <div className="relative h-[180px]">
          <Image
            fill
            sizes="100%"
            src={projectCardData.image}
            alt={projectCardData.title}
            className="object-cover rounded-t-lg"
          />
        </div>
      }
      className="flex flex-col h-full"
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "16px",
        },
      }}
    >
      <div className="flex-grow">
        <Title level={4} className="line-clamp-3">
          {projectCardData.title}
        </Title>
        <Text type="secondary" className="line-clamp-2">
          {projectCardData.description}
        </Text>
      </div>

      <div className="grid gap-[8px] grid-cols-[1fr_32px] mt-[16px]">
        <Button type="primary">Action</Button>
        <Button icon={<HeartOutlined />} />
      </div>
    </Card>
  );
};

export default ProjectCard;
