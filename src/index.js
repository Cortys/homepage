import smoothscroll from "smoothscroll-polyfill";

import { router } from "./router";
import "./pages/main/MainPage";

smoothscroll.polyfill();
router.setOutlet(document.body);
