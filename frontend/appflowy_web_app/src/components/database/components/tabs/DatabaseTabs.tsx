import { DatabaseViewLayout, YDatabaseView, YjsDatabaseKey } from '@/application/collab.type';
import { useDatabase, useDatabaseView } from '@/application/database-yjs';
import { DatabaseActions } from '@/components/database/components/conditions';
import { Tooltip } from '@mui/material';
import { forwardRef, FunctionComponent, SVGProps, useMemo } from 'react';
import { ViewTabs, ViewTab } from './ViewTabs';
import { useTranslation } from 'react-i18next';

import { ReactComponent as GridSvg } from '@/assets/grid.svg';
import { ReactComponent as BoardSvg } from '@/assets/board.svg';
import { ReactComponent as CalendarSvg } from '@/assets/calendar.svg';

export interface DatabaseTabBarProps {
  viewIds: string[];
  selectedViewId?: string;
  setSelectedViewId?: (viewId: string) => void;
  viewName?: string;
  iidIndex: string;
  hideConditions?: boolean;
}

const DatabaseIcons: {
  [key in DatabaseViewLayout]: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined }>;
} = {
  [DatabaseViewLayout.Grid]: GridSvg,
  [DatabaseViewLayout.Board]: BoardSvg,
  [DatabaseViewLayout.Calendar]: CalendarSvg,
};

export const DatabaseTabs = forwardRef<HTMLDivElement, DatabaseTabBarProps>(
  ({ viewIds, viewName, hideConditions, iidIndex, selectedViewId, setSelectedViewId }, ref) => {
    const { t } = useTranslation();
    const view = useDatabaseView();
    const views = useDatabase().get(YjsDatabaseKey.views);
    const layout = Number(view?.get(YjsDatabaseKey.layout)) as DatabaseViewLayout;

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
      setSelectedViewId?.(newValue);
    };

    const className = useMemo(() => {
      const classList = ['-mb-[0.5px] flex items-center overflow-hidden border-line-divider text-text-title'];

      if (layout === DatabaseViewLayout.Calendar) {
        classList.push('border-b');
      }

      return classList.join(' ');
    }, [layout]);

    if (viewIds.length === 0) return null;
    return (
      <div ref={ref} className={className}>
        <div
          style={{
            width: 'calc(100% - 120px)',
          }}
          className='flex items-center '
        >
          <ViewTabs
            scrollButtons={false}
            variant='scrollable'
            allowScrollButtonsMobile
            value={selectedViewId}
            onChange={handleChange}
          >
            {viewIds.map((viewId) => {
              const view = views?.get(viewId) as YDatabaseView | null;

              if (!view) return null;
              const layout = Number(view.get(YjsDatabaseKey.layout)) as DatabaseViewLayout;
              const Icon = DatabaseIcons[layout];
              const name = viewId === iidIndex ? viewName : view.get(YjsDatabaseKey.name);

              return (
                <ViewTab
                  key={viewId}
                  data-testid={`view-tab-${viewId}`}
                  icon={<Icon className={'h-4 w-4'} />}
                  iconPosition='start'
                  color='inherit'
                  label={
                    <Tooltip title={name} enterDelay={1000} enterNextDelay={1000} placement={'right'}>
                      <span className={'max-w-[120px] truncate'}>{name || t('grid.title.placeholder')}</span>
                    </Tooltip>
                  }
                  value={viewId}
                />
              );
            })}
          </ViewTabs>
        </div>
        {!hideConditions && layout !== DatabaseViewLayout.Calendar ? <DatabaseActions /> : null}
      </div>
    );
  }
);
