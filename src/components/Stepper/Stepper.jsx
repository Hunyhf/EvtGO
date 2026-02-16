import React from 'react';
import classNames from 'classnames/bind';
import styles from './Stepper.module.scss';

const cx = classNames.bind(styles);

const Stepper = ({ steps, currentStep, onNext }) => {
    return (
        <div className={cx('stepperWrapper')}>
            <div className={cx('container')}>
                <div className={cx('stepper')}>
                    {steps.map(step => (
                        <div
                            key={step.id}
                            className={cx('step', {
                                activeStep: currentStep === step.id,
                                passedStep: currentStep > step.id
                            })}
                        >
                            <div className={cx('stepCircle')}>{step.id}</div>
                            <span className={cx('stepLabel')}>
                                {step.label}
                            </span>
                            {step.id !== steps.length && (
                                <div className={cx('stepLine')}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={cx('actions')}>
                    <button className={cx('btnPrimary')} onClick={onNext}>
                        {currentStep === steps.length ? 'Hoàn tất' : 'Tiếp tục'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Stepper;
