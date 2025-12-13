const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`pb-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`py-4 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`pt-4 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

export default Card;
