import useScrollToTop from '../../hooks/useScrollToTop';

const PageWrapper = ({ children }) => {
  useScrollToTop();

  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
};

export default PageWrapper; 