/**
 * @jest-environment jsdom
 */

import { ROUTES, ROUTES_PATH } from "../constants/routes"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import {localStorageMock} from "../__mocks__/localStorage"
import { fireEvent , waitFor} from "@testing-library/dom";
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
  describe("When I am on NewBill Page", () => {
    test("Then i click the file button", () => {
      const localStorage = localStorageMock
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage:localStorage,
      })
      const handleChangeFile = jest.fn((e)=> newBill.handleChangeFile(e))
      const inputFile = document.querySelector(`input[data-testid="file"]`)
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile);
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })    
  test("Then i enter a valid file",async () => {
    const localStorage = localStorageMock
    const html = NewBillUI()
    document.body.innerHTML = html
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage:localStorage,
    })
    const inputFile = document.querySelector(`input[data-testid="file"]`)
    const bill = mockStore.bills();
    const spy = jest.spyOn(bill, 'create'); 
    const fakeFile = new File(['test file content'], 'test-file.png');
    console.log(fakeFile)
    fireEvent.change(inputFile,{target: {
      files:[fakeFile]}})
    await waitFor(()=>2000)
    expect(spy).toHaveBeenCalled()
  })
  test("Then i press the submit button and expect a bill to be created", async()=>{
    const localStorage = localStorageMock
    const html = NewBillUI()
    document.body.innerHTML = html
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage:localStorage,
    })
    const handleSubmit = jest.fn((e)=>newBill.handleSubmit(e))
    const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit",handleSubmit)
    const submitButton = document.getElementById('btn-send-bill')
    const bill = mockStore.bills();
    const spy = jest.spyOn(bill, 'update');
    fireEvent.click(submitButton);
    expect(handleSubmit).toHaveBeenCalled()
    await waitFor(()=>2000)
    expect(spy).toHaveBeenCalled()
  })
})
