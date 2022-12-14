/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event"


jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
});

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname,
  });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      bills.map((doc)=>{doc.originalDate = doc.date ?? ''})
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then i click on the eye icon",()=>{
      const bill = new Bills({
        document,
        onNavigate,
        localStorage:localStorageMock,
      })
      const handleClickIconEye =  jest.fn((icon) => bill.handleClickIconEye(icon))
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
      const modal = document.getElementById('modaleFile');
      $.fn.modal = jest.fn(()=>modal.classList.add('show'))
      if (iconEye) iconEye.forEach( (icon) => {
        icon.addEventListener('click',handleClickIconEye(icon))
        userEvent.click(icon)
      }) 
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    test("Then i should load the bills",async()=>{
      const bills = await mockStore.bills().list();
      expect(bills.length).toBe(4);
    });
  })
})
