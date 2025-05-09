// src/components/common/AppPagination.jsx
import React from 'react';
import { Pagination } from 'antd';

const AppPagination = ({ currentPage, totalItems, pageSize, onChange }) => {
  if (totalItems === 0) return null;

  // Ant Design Pagination hides if total <= pageSize by default.
  // To always show it, we can ensure total is slightly larger than pageSize
  // or simply rely on its default behavior. The requirement "even if there is only one page"
  // means the component itself should be rendered. AntD does this if total > 0.
  // The `showSizeChanger={false}` can simplify if pageSize is fixed.
  // `hideOnSinglePage={false}` is what we need, but it's true by default.
  // Actually, Pagination component in AntD version 4+ shows if total > 0.

  return (
    <div className="mt-8 flex justify-center">
      <Pagination
        current={currentPage}
        total={totalItems}
        pageSize={pageSize}
        onChange={onChange} // (page, pageSize) => onChange(page)
        showSizeChanger={false} // Or true if you want to change items per page
        // hideOnSinglePage={false} // This prop doesn't exist. AntD shows if total > 0.
                                // If total <= pageSize, it shows only page '1'.
      />
    </div>
  );
};

export default AppPagination;