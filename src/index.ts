interface Product<T> {
  id: T;
  name: string;
  basePrice: number;
  category: string;

  getDiscountedPrice(discount: number): number;
}

interface PaymentMethod {
  processPayment(amount: number): Promise<boolean>;
  validatePayment(): boolean;
  getTransactionId(): string;
}

class BaseProduct implements Product<number> {
  constructor(
    public id: number,
    public name: string,
    public basePrice: number,
    public category: string
  ) {}

  getDiscountedPrice(discount: number): number {
    return (
      this.basePrice -
      (this.basePrice * discount) / 100
    );
  }
}

class ElectronicsProduct extends BaseProduct {
  constructor(
    id: number,
    name: string,
    basePrice: number,
    public warrantyPeriod: number
  ) {
    super(id, name, basePrice, "Electronics");
  }

  override getDiscountedPrice(discount: number): number {
    discount = Math.min(discount, 20);

    if (this.warrantyPeriod > 2) {
      discount += 5;
    }

    return (
      this.basePrice -
      (this.basePrice * discount) / 100
    );
  }
}

class ClothingProduct extends BaseProduct {
  constructor(
    id: number,
    name: string,
    basePrice: number,
    public size: string
  ) {
    super(id, name, basePrice, "Clothing");
  }

  override getDiscountedPrice(discount: number): number {
    discount = Math.min(discount, 40);

    if (this.size === "XL") {
      discount += 10;
    }

    return (
      this.basePrice -
      (this.basePrice * discount) / 100
    );
  }
}

class Inventory<T extends { id: number }> {
  private items: T[] = [];

  addItem(item: T): void {
    this.items.push(item);
  }

  removeItem(id: string): boolean {
    const index = this.items.findIndex(
      (item) => item.id === Number(id)
    );

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  findById(id: string): T | undefined {
    return this.items.find(
      (item) => item.id === Number(id)
    );
  }

  getAllItems(): T[] {
    return this.items;
  }
}

class CreditCardPayment implements PaymentMethod {
  private transactionId: string;

  constructor(private cardNumber: string) {
    this.transactionId = "CC-" + Date.now();
  }

  validatePayment(): boolean {
    return this.cardNumber.length === 16;
  }

  async processPayment(amount: number): Promise<boolean> {
    console.log(
      `Processing Credit Card Payment: ₹${amount}`
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.validatePayment());
      }, 1000);
    });
  }

  getTransactionId(): string {
    return this.transactionId;
  }
}

class PayPalPayment implements PaymentMethod {
  private transactionId: string;

  constructor(private email: string) {
    this.transactionId = "PP-" + Date.now();
  }

  validatePayment(): boolean {
    return this.email.includes("@");
  }

  async processPayment(amount: number): Promise<boolean> {
    console.log(
      `Processing PayPal Payment: ₹${amount}`
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.validatePayment());
      }, 1000);
    });
  }

  getTransactionId(): string {
    return this.transactionId;
  }
}

class Order {
  private products: {
    product: Product<number>;
    quantity: number;
  }[] = [];

  constructor(
    private paymentMethod: PaymentMethod
  ) {}

  addProduct(
    product: Product<number>,
    quantity: number
  ): void {
    this.products.push({
      product,
      quantity,
    });
  }

  calculateSubtotal(): number {
    return this.products.reduce(
      (total, item) =>
        total +
        item.product.basePrice *
          item.quantity,
      0
    );
  }

  async checkout(): Promise<{
    success: boolean;
    transactionId: string;
  }> {
    const subtotal =
      this.calculateSubtotal();

    const finalAmount =
      subtotal - subtotal * 0.1;

    const success =
      await this.paymentMethod.processPayment(
        finalAmount
      );

    return {
      success,
      transactionId:
        this.paymentMethod.getTransactionId(),
    };
  }
}

async function main() {
  const laptop =
    new ElectronicsProduct(
      1,
      "Laptop",
      50000,
      3
    );

  const tshirt =
    new ClothingProduct(
      2,
      "T-Shirt",
      1000,
      "XL"
    );

  console.log(
    "Laptop Discounted Price:",
    laptop.getDiscountedPrice(15)
  );

  console.log(
    "T-Shirt Discounted Price:",
    tshirt.getDiscountedPrice(20)
  );

  const inventory =
    new Inventory<BaseProduct>();

  inventory.addItem(laptop);
  inventory.addItem(tshirt);

  console.log(
    "\nInventory:",
    inventory.getAllItems()
  );

  const payment =
    new CreditCardPayment(
      "1234567812345678"
    );

  const order =
    new Order(payment);

  order.addProduct(laptop, 1);
  order.addProduct(tshirt, 2);

  console.log(
    "\nSubtotal:",
    order.calculateSubtotal()
  );

  const result =
    await order.checkout();

  console.log(
    "\nCheckout Result:"
  );
  console.log(result);
}

main();