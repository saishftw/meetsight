import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import '../ui/react-accordion.css';
import { IssueTracker } from '@/lib/domains';
import clsx from 'clsx';

export default function AccordionDemo({ issues }: { issues?: IssueTracker[] }) {
    return (
        <Accordion.Root className="AccordionRoot w-full" type="single" defaultValue="item-1" collapsible>
            {issues?.map((item, id) => (
                <Accordion.Item key={`accordion-${id}`} className="AccordionItem" value={item.issue}>
                    <AccordionTrigger className="text-sm">{item.issue}</AccordionTrigger>
                    <AccordionContent>
                        <div>
                            <div className=' border border-gray-200 p-2'>
                                <label className="font-small font-bold pl-4" >
                                    Flagged behaiour:
                                </label>
                                <p key={`fb-paragraph-${id}`} className='mt-1 pl-4'>{item.flagged_behaviour}</p>
                            </div>
                            <div className=' border border-gray-200 p-2'>
                                <label className="font-small font-bold pl-4" >
                                    Potential root cause:
                                </label>
                                <p key={`prc-paragraph-${id}`} className='mt-1 pl-4'>{item.potential_root_cause}</p>
                            </div>

                            <div className=' border border-gray-200 p-2'>
                                <label className="font-small font-bold pl-4" >
                                    Suggested solutions:
                                </label>
                                <p key={`ssh-paragraph-${id}`} className='mt-2 pl-4'>By attendees:</p>
                                {item?.solutions_by_human?.map((s, sid) =>
                                    <p key={sid} className='px-1 text-sm mt-1 pl-4'>   • {s.solution}
                                        <span className={clsx('rounded-full px-2 py-1 text-xs font-semibold font-mono ml-1 inline-block', {
                                            'bg-green-300': s.score >= 0.6,
                                            'bg-yellow-300': s.score < 0.6
                                        })}>
                                            Score: {s.score}
                                        </span>
                                    </p>
                                )}

                                <p key={`ssa-paragraph-${id}`} className='mt-2 pl-4'>By AI:</p>
                                {item?.solutions_by_ai?.map((s, sid) =>
                                    <p key={sid} className='px-1  mt-1 pl-4'>   • {s.solution}
                                        <span className={clsx('rounded-full px-2 py-1 text-xs font-semibold font-mono ml-1 inline-block', {
                                            'bg-green-300': s.score >= 0.6,
                                            'bg-yellow-300': s.score < 0.6
                                        })}>
                                            Score: {s.score}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
};

const AccordionTrigger: React.FC<{ children: React.ReactNode; className?: string; }> = React.forwardRef(
    ({ children, className, ...props }, forwardedRef: any) => (
        <Accordion.Header className="AccordionHeader">
            <Accordion.Trigger
                className={classNames('AccordionTrigger', className)}
                {...props}
                ref={forwardedRef}
            >
                {children}
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
            </Accordion.Trigger>
        </Accordion.Header>
    )
);

const AccordionContent: React.FC<{ children: React.ReactNode; className?: string; }> = React.forwardRef(
    ({ children, className, ...props }, forwardedRef: any) => (
        <Accordion.Content
            className={classNames('AccordionContent', className)}
            {...props}
            ref={forwardedRef}
        >
            <div className="AccordionContentText">{children}</div>
        </Accordion.Content>
    )
);

AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

// export default AccordionDemo;
