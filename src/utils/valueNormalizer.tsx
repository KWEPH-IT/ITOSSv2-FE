import dayjs from "dayjs";
import { Tag } from "antd";

export const normalizeValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeValues(item));
  }

  if (obj && typeof obj === "object") {
    const newObj: any = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];

      // 🔥 Detect Dayjs object
      if (dayjs.isDayjs(value)) {
        newObj[key] = value.toISOString();
      } 
      // 🔁 Recursive (for groups / arrays)
      else if (typeof value === "object") {
        newObj[key] = normalizeValues(value);
      } 
      else {
        newObj[key] = value;
      }
    });

    return newObj;
  }

  return obj;
};


export const formatLabel = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const isFileArray = (value: any) => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value[0]?.filename &&
    (value[0]?.path || value[0]?.stored_filename)
  );
};


const buildFileUrl = (file: any) => {
  const BASE_URL = "https://your-domain.com"; // change this

  if (!file?.path) return "#";

  // normalize Windows + relative path
  const cleanPath = file.path
    .replace("./app/uploads", "/uploads")
    .replace(/\\/g, "/");

  return `${BASE_URL}${cleanPath}`;
};


export const renderValue = (value: any, key: string) => {
  // FILE FIELDS (dynamic detection)
  if (isFileArray(value)) {
    return value.map((file: any, i: number) => (
      <div key={i}>
        📎{" "}
        <a
          href={buildFileUrl(file)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.filename}
        </a>
      </div>
    ));
  }

  // HTML fields (Description)
  if (typeof value === "string" && value.includes("<p>")) {
    return <div dangerouslySetInnerHTML={{ __html: value }} />;
  }

  // plain values
  if (typeof value === "number" || typeof value === "string") {
    return value.toString();
  }

  // fallback (objects)
  return <Tag>{JSON.stringify(value)}</Tag>;
};