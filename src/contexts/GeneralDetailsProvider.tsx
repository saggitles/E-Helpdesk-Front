import {
  createContext,
  FC,
  useContext,
  useState,
  ReactNode,
  useMemo,
  SetStateAction,
  Dispatch,
} from 'react';

export type EventCategories = {
  impacts: boolean;
  preop: boolean;
  sessions: boolean;
};

export type EquipmentInfo = {};

export interface GeneralDetailsContextType {
  customer: string;
  setCustomer: Dispatch<SetStateAction<string>>;
  equipmentID: string;
  setEquipmentID: Dispatch<SetStateAction<string>>;
  equipmentInfo: EquipmentInfo[]; // TODO - type this
  setEquipmentInfo: Dispatch<SetStateAction<EquipmentInfo[]>>;
  displaySiteDetails: boolean;
  setDisplaySiteDetails: Dispatch<SetStateAction<boolean>>;
  displayDriverHistory: boolean;
  setDisplayDriverHistory: Dispatch<SetStateAction<boolean>>;
  displayEvent: boolean;
  setDisplayEvent: Dispatch<SetStateAction<boolean>>;
  eventCategories: EventCategories;
  setEventCategories: Dispatch<SetStateAction<EventCategories>>;
  displayWebsiteSettings: boolean;
  setDisplayWebsiteSettings: Dispatch<SetStateAction<boolean>>;
  displayTimeline: boolean;
  setDisplayTimeline: Dispatch<SetStateAction<boolean>>;
  displayEquipmentDetails: boolean;
  setDisplayEquipmentDetails: Dispatch<SetStateAction<boolean>>;
}

export const GeneralDetailsContext =
  createContext<GeneralDetailsContextType>(
    {} as GeneralDetailsContextType
  );

export const useGenerateDetails = () => useContext(GeneralDetailsContext);

interface GeneralDetailsProviderProps {
  children: ReactNode;
}

export const GeneralDetailsProvider: FC<GeneralDetailsProviderProps> = ({
  children,
}) => {
  const [customer, setCustomer] = useState('');
  const [equipmentID, setEquipmentID] = useState('');
  const [equipmentInfo, setEquipmentInfo] = useState<any[]>([]);
  const [displaySiteDetails, setDisplaySiteDetails] = useState(false);
  const [displayDriverHistory, setDisplayDriverHistory] = useState(false);
  const [displayEvent, setDisplayEvent] = useState(false);
  const [eventCategories, setEventCategories] = useState<EventCategories>(
    {} as EventCategories
  );

  const [displayWebsiteSettings, setDisplayWebsiteSettings] =
    useState(false);
  const [displayTimeline, setDisplayTimeline] = useState(false);
  const [displayEquipmentDetails, setDisplayEquipmentDetails] =
    useState(false);

  const value = useMemo(() => {
    return {
      customer,
      setCustomer,
      equipmentID,
      setEquipmentID,
      equipmentInfo,
      setEquipmentInfo,
      displaySiteDetails,
      setDisplaySiteDetails,
      displayDriverHistory,
      setDisplayDriverHistory,
      displayEvent,
      setDisplayEvent,
      eventCategories,
      setEventCategories,
      displayWebsiteSettings,
      setDisplayWebsiteSettings,
      displayTimeline,
      setDisplayTimeline,
      displayEquipmentDetails,
      setDisplayEquipmentDetails,
    };
  }, [
    customer,
    equipmentID,
    equipmentInfo,
    displaySiteDetails,
    displayDriverHistory,
    displayEvent,
    eventCategories,
    displayWebsiteSettings,
    displayTimeline,
    displayEquipmentDetails,
  ]);

  return (
    <GeneralDetailsContext.Provider value={value}>
      {children}
    </GeneralDetailsContext.Provider>
  );
};
