import Link from 'next/link';
import React from 'react';

const NextLink = ({ href, children, ...props }) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export default NextLink;
