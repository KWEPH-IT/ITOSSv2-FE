import dayjs from "dayjs";
import { Tag, Table, Descriptions } from "antd";

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



const renderDynamicTable = (data: Record<string, any>[]) => {
  if (!data.length) return "-";

  const keys = [...new Set(data.flatMap(item => Object.keys(item)))];

  const columns = keys.map(key => ({
    title: formatLabel(key),
    dataIndex: key,
    key,
    render: (value: any) =>
      value === null || value === undefined ? "-" : String(value),
  }));

  return (
    <Table
      size="small"
      bordered
      pagination={false}
      rowKey={(_, index) => index!}
      columns={columns}
      dataSource={data}
      scroll={{ x: "max-content" }}
      components={{
        body: {
          cell: (props: any) => {
            const { children, ...restProps } = props;
    
            return (
              <td
                {...restProps}
                style={{
                  fontSize: "10px",
                  padding: "4px 8px",
                  color: "#555",
                }}
              >
                {children}
              </td>
            );
          },
        },
        header: {
          cell: (props: any) => {
            const { children, ...restProps } = props;
    
            return (
              <th
                {...restProps}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "6px 8px",
                }}
              >
                {children}
              </th>
            );
          },
        },
      }}
    />
  );
};

export const renderValue = (value: any) => {
  // FILE FIELDS
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

  // HTML
  if (typeof value === "string" && value.includes("<p>")) {
    return <div dangerouslySetInnerHTML={{ __html: value }} />;
  }

  // JSON string
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      // Array of objects -> Table
      if (
        Array.isArray(parsed) &&
        parsed.every(item => item && typeof item === "object" && !Array.isArray(item))
      ) {
        return renderDynamicTable(parsed);
      }

      // Array of primitives
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }

      // Object
      if (parsed && typeof parsed === "object") {
        return (
          <Descriptions size="small" column={1} bordered>
            {Object.entries(parsed).map(([k, v]) => (
              <Descriptions.Item key={k} label={formatLabel(k)}>
                {String(v)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        );
      }
    } catch {
      // Not JSON
    }

    return value;
  }

  // Number
  if (typeof value === "number") {
    return value.toString();
  }

  // Already an object/array
  if (Array.isArray(value)) {
    return value.every(item => typeof item === "object")
      ? renderDynamicTable(value)
      : value.join(", ");
  }

  if (value && typeof value === "object") {
    return (
      <Descriptions size="small" column={1} bordered >
        {Object.entries(value).map(([k, v]) => (
          <Descriptions.Item key={k} label={formatLabel(k)} style={{ fontSize:10 }} >
            {String(v)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  return <Tag>{String(value)}</Tag>;
};



// export const renderValue = (value: any) => {
//   // FILE FIELDS (dynamic detection)
//   if (isFileArray(value)) {
//     return value.map((file: any, i: number) => (
//       <div key={i}>
//         📎{" "}
//         <a
//           href={buildFileUrl(file)}
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           {file.filename}
//         </a>
//       </div>
//     ));
//   }

  // HTML fields (Description)
//   if (typeof value === "string" && value.includes("<p>")) {
//     return <div dangerouslySetInnerHTML={{ __html: value }} />;
//   }

//   // plain values
//   if (typeof value === "number" || typeof value === "string") {
//     return value.toString();
//   }

//   // fallback (objects)
//   return <Tag>{JSON.stringify(value)}</Tag>;
// };