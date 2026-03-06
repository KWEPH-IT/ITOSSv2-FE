import { Table } from 'antd';
import type { TableProps as AntTableProps } from 'antd';

interface StyledTableProps<T>
  extends Omit<AntTableProps<T>, 'dataSource'> {
  data: T[];
}

export const StyledTable = <T extends object>({
  data,
  ...rest
}: StyledTableProps<T>) => {
  return (
    <Table<T>
      {...rest}                 // ✅ rowSelection, columns, etc.
      dataSource={data}         // ✅ map `data` → `dataSource`
      components={{
        body: {
          cell: (props: any) => {
            const { children, ...restProps } = props;
            return (
              <td
                {...restProps}
                style={{
                  fontSize: '12px',
                  padding: '10px',
                  letterSpacing: '0.7px',
                  color: '#555',
                }}
              >
                {children}
              </td>
            );
          },
        },
      }}
      pagination={{
        pageSize: 10,
        showTotal: (total, range) =>
          `${range[0]}–${range[1]} of ${total} users`,
      }}
    />
  );
};
