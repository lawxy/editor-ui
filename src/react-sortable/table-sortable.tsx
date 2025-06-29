import React, { useEffect, useRef } from 'react';
import type { FC } from 'react';
import Sortable from 'sortablejs';
import { Table, Button, type TableProps } from 'antd';
import { cloneDeep } from 'lodash-es';
import { MenuOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';

export const TableSortable: FC<
  TableProps<any> & {
    onSort: (v: any) => void;
  }
> = ({ onSort, ...props }) => {
  const tableRef = useRef<any>();
  const dataSourceRef = useRef<any>();
  dataSourceRef.current = cloneDeep(props.dataSource);

  useEffect(() => {
    if (!tableRef.current) return;
    const rowEl = tableRef.current.querySelector('.ant-table-tbody');
    new Sortable(rowEl, {
      animation: 150,
      // group: 'list',
      handle: '.draggble-btn',
      onSort: function (e: any) {
        const { newIndex, oldIndex } = e;
        // 为什么这里的索引都会比真实的大1 ？？
        const newValueOptions = arrayMoveImmutable(
          dataSourceRef.current || [],
          oldIndex - 1,
          newIndex - 1,
        );
        onSort(newValueOptions);
      },
    });
    return () => {
      // 这里destroy后会出现元素不能第一时间拖拽，这个方法会造成全局污染？
      // sortIns?.destroy?.();
    };
  }, [tableRef.current]);

  const columns = [
    {
      key: 'sort',
      align: 'center',
      width: 40,
      render: () => {
        return (
          <Button
            className="draggble-btn"
            type="text"
            size="small"
            icon={<MenuOutlined />}
            style={{ cursor: 'move' }}
          />
        );
      },
    },
    ...(props.columns as any),
  ];

  return (
    <div ref={tableRef}>
      <Table {...props} columns={columns} />
    </div>
  );
};
