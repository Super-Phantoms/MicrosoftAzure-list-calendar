import React, { useEffect, useState } from "react";
import { Providers } from "@microsoft/mgt-element";
import { Login, Get } from "@microsoft/mgt-react";
import "./App.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { MsalProvider } from "@microsoft/mgt-msal-provider";
import { ProxyProvider } from "@microsoft/mgt-proxy-provider";
import {
  useSiteEditUrl,
  checkProxy,
  AdaptiveCard,
  Calender,
} from "wp-webcomponent";

const formatDate = (date) => {
  const tempDate = new Date(date);
  const now_utc = Date.UTC(
    tempDate.getUTCFullYear(),
    tempDate.getUTCMonth(),
    tempDate.getUTCDate(),
    tempDate.getUTCHours(),
    tempDate.getUTCMinutes(),
    tempDate.getUTCSeconds()
  );
  return new Date(now_utc);
};

const buildQuery = (props, siteDetails) => {
  let url = `/sites/${props.site_id ?? siteDetails?.siteId}/lists/${
    props.list_id ?? siteDetails?.listId
  }/items`;
  let hasQuery = false;
  if (props.columns) {
    url += `?expand=fields(select=${props.columns})`;
    hasQuery = true;
  } else {
    url += `?expand=fields(select=EndDate,EventDate,Title)`;
    hasQuery = true;
  }
  if (props.category) {
    url += hasQuery ? "&" : "?";
    url += `filter=Category eq '${props.category}'`;
  }
  if (props.from_date) {
    url += hasQuery ? "&" : "?";
    url += `filter=EventDate gt '${props.from_date}'`;
  }
  if (props.to_date) {
    url += hasQuery ? "&" : "?";
    url += `filter=EventDate lt '${props.from_date}'`;
  }
  return url;
};
function App(props) {
  // setup proxy
  const serverProxyDomain = checkProxy(); 
  Providers.globalProvider = new ProxyProvider("https://walrus-app-v3k99.ondigitalocean.app/proxy/63e4ce5542771d5254e2525c");

  // setup initial data
  const siteDetails = useSiteEditUrl(props.list_setting_url, props.site_name);
  const [eventsData, setEventsData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const Events = (eventProps) => {
    const tempData = [];

    useEffect(() => {
      eventProps.dataContext.value.forEach((event) => {
        tempData.push({
          title: event.fields.Title,
          start: formatDate(event.fields.EventDate),
          end: formatDate(event.fields.EndDate),
        });
      });
      setEventsData(tempData);
      setDataLoaded(true);
      window.dispatchEvent(
        new CustomEvent("on_event_data_loaded", {
          detail: {
            events: {
              events: tempData,
            },
            template: props.template ?? Calender.template,
          },
        })
      );
    }, [eventProps.dataContext.value]);

    return <></>;
  };

  console.log({
    eventsData,
    props
  });

  const AdaptiveCardLayout = Calender;

  return (
    <>
      {siteDetails.error && <p>{siteDetails.error}</p>}
      <h1>{props.title ?? "List Calender"}</h1>
      <Login />
      {!dataLoaded && <p>Loading data..</p>}
      {!siteDetails.loading && (
        <Get
          // resource={'/me/calendar/events'}
          resource={buildQuery(props, siteDetails)}
          version="v1.0"
        >
          <Events />
        </Get>
      )}
      {props.layout === "calender" && dataLoaded && (
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          weekends={!!props.weekends}
          events={eventsData}
          // eventContent={renderEventContent}
        />
      )}
      {props.layout === "list" && dataLoaded && (
        <div>
          <AdaptiveCard
            data={{
              events: eventsData.slice(0, 5),
            }}
            card={props.props ?? AdaptiveCardLayout.template}
          />
        </div>
      )}
    </>
  );
}

export const Definition1 = {
  clientId: {
    title: "Client Id For sign in",
    type: "string",
  },
  list_setting_url: {
    title: "List Setting URL",
    type: "string",
  },
  site_id: {
    title: "Site Id",
    type: "string",
  },
  site_name: {
    title: "Site name",
    type: "string",
  },
  list_id: {
    title: "List Id",
    type: "string",
  },
  title: {
    title: "Title",
    type: "string",
  },
  template: {
    title: "Template",
    type: "string",
  },
  layout: {
    title: "layout",
    type: "string",
    enum: ["calender", "adaptive card"],
  },
  columns: {
    title: "Columns",
    type: "string",
    default:
      "EndDate,EventDate,Category,ID,Location,Title,fAllDayEvent,RecurrenceID,fRecurrence,RecurrenceData,MasterSeriesItemID,Description,Author/Title,Attachments",
  },
  initial_month: {
    title: "Initial month in number(0-11)",
    type: "number",
  },
  weekends: {
    type: "boolean",
  },
  category: {
    title: "Category",
    type: "string",
  },
  to_date: {
    title: "End Date",
    type: "string",
    format: "date",
  },
  from_date: {
    title: "Start Date",
    type: "string",
    format: "date",
  },
};

export const Definition = [
  {
    zone: "appearances",
    component: "HeadingColorAndSize",
    name: ["headingColor", "headingSize"],
    createSeparateSection: true,
    title: "Heading",
  },
  {
    zone: "appearances",
    component: "TextBox",
    name: "title",
    createSeparateSection: true,
    title: "Some textbox",
    displayName: "Title",
  },
  {
    zone: "appearances",
    component: "TextBox",
    name: "description",
    displayName: "Description",
    createSeparateSection: true,
    title: "Description",
  },
  {
    zone: "appearances",
    component: "HeadingColorAndSize",
    name: ["headingColor", "headingSize"],
  },
  {
    component: "TextBox",
    name: "clientId",
    displayName: "Client Id",
  },
  {
    component: "TextBox",
    name: "list_setting_url",
    displayName: "List setting URL",
  },
  {
    component: "TextBox",
    name: "site_id",
    displayName: "Site Id",
  },
  {
    component: "TextBox",
    name: "site_name",
    displayName: "Site Name",
  },
  {
    component: "TextBox",
    name: "list_id",
    displayName: "List Name",
  },
  {
    component: "TextBox",
    name: "template",
    displayName: "Template",
  },
  {
    component: "TextBox",
    name: "columns",
    displayName: "Columns",
  },
  {
    component: "TextBox",
    name: "category",
    displayName: "Category",
  },
  {
    component: "TextBox",
    name: "from_date",
    displayName: "Start Date",
  },
  {
    component: "TextBox",
    name: "to_date",
    displayName: "End Date",
  },
  {
    component: "TextBox",
    name: "initial_month",
    displayName: "Initial Month",
  },
  {
    zone: "layout",
    component: "ComponentLayout",
    name: ["layout", "layoutSpacing"],
    enum: ["list", "month", "grid"],
  },
  {
    zone: "layout",
    component: "TextBox",
    name: "to_date",
    displayName: "End Date",
  },
];

export const ProxyPayload = {
  site_id: "87fb8dbb-4dd8-42e6-8ab9-8bf82b1319f5",
  list_id: "752f0c5c-2d79-4d6a-b694-0184a3fb63c4",
  site_name: "DWS Team Portal",
  list_setting_url:
    "https://dwsnow.sharepoint.com/aloedev/_layouts/15/listedit.aspx?List=%7B752f0c5c-2d79-4d6a-b694-0184a3fb63c4%7D",
};

export default App;
