import React from 'react';
import { useStyletron } from 'baseui';

interface ComponentTemplateProps {
  title: string;
  children?: React.ReactNode;
}

const ComponentTemplate: React.FC<ComponentTemplateProps> = ({ title, children }) => {
  const [css] = useStyletron();
  
  return (
    <div className={css({ padding: '16px' })}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default ComponentTemplate; 