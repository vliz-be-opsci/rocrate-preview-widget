import './index.css'; // Importing the tailwind css file
import r2wc from '@r2wc/react-to-web-component';
import MainContainer from './components/main_container/MainContainer';

const R2WCMainContainer = r2wc(MainContainer,{props: {rocrate: '{}', crate_name:"", version:""}});

customElements.define('rocrate-preview-widget', R2WCMainContainer);