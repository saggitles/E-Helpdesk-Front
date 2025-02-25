import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TailSpin } from 'react-loader-spinner';

interface BoxProps {
  title: string;
  width: string;
  displayExpand?: boolean;
  expand?: boolean;
  setExpand?: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  close?: boolean;
  setAlert?: React.Dispatch<React.SetStateAction<boolean>>;
  list?: boolean;
  loading?: boolean;
}

function Box({
  title,
  width,
  displayExpand,
  expand,
  setExpand,
  children,
  close,
  setAlert,
  list,
  loading,
}: BoxProps) {
  return (
    <div
      className={`w-[80vw] flex flex-col my-8 mx-16 bg-[rgb(245, 245,245)] border border-solid border-[#bbbbbb] ${
        list ? 'max-h-[200px]' : 'max-h-fit'
      } ${width ? `w-[${width}] : 'w-[390px]'` : ''}`}
    >
      <div className='w-full h-[30px] flex items-center justify-between bg-[#bbbbbb]'>
        <p className='ml-2'>{title}</p>
        {expand && displayExpand ? (
          <FontAwesomeIcon
            icon={faChevronUp}
            onClick={(_) => {
              if (setExpand) setExpand(false);
            }}
            className='BoxExpandIcon'
          />
        ) : !expand && displayExpand ? (
          loading ? (
            <div className='mr-4'>
              <TailSpin color='#000' height={15} width={15} />
            </div>
          ) : (
            <FontAwesomeIcon
              icon={faChevronDown}
              onClick={(_) => {
                if (setExpand) setExpand(true);
              }}
              className='BoxExpandIcon'
            />
          )
        ) : (
          close && (
            <FontAwesomeIcon
              onClick={(_) => {
                if (setAlert) setAlert(false);
              }}
              icon={faTimesCircle}
              className='BoxCloseIcon'
            />
          )
        )}
      </div>
      {children}
    </div>
  );
}

export default Box;
