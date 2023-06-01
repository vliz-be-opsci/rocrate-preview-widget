import './index.css';
import r2wc from '@r2wc/react-to-web-component';
import MainContainer from './components/main_container/MainContainer';

const R2WCMainContainer = r2wc(MainContainer,{props: {rocrate: {}}});

customElements.define('rocrate-preview-widget', R2WCMainContainer);