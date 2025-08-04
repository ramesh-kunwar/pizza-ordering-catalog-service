import toppingModal from "./topping-modal";
import { Topping } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        return await toppingModal.create(topping);
    }
}
