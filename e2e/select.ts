import { expect, type Locator, type Page } from "@playwright/test";

export const NETWORK_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  sepolia: "Sepolia (testnet)",
  solana: "Solana",
};

function pageOf(scope: Page | Locator) {
  return "page" in scope ? scope.page() : scope;
}

export async function chooseOption(
  scope: Page | Locator,
  label: string,
  option: string,
) {
  await scope.getByLabel(label).click();

  const page = pageOf(scope);
  await page.getByRole("option", { name: option, exact: true }).click();
  await expect(page.getByRole("listbox")).toBeHidden();
}

export async function chooseNetwork(
  scope: Page | Locator,
  networkId: string,
) {
  await chooseOption(scope, "Rede", NETWORK_LABELS[networkId]);
}
