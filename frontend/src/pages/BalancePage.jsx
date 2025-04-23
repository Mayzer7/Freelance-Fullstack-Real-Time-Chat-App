import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getBalance, updateBalance } from "../api/balance";
import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import toast from "react-hot-toast";

const BalancePage = () => {
  const { authUser } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Не удалось загрузить баланс");
    }
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    setIsLoading(true);
    try {
      const data = await updateBalance(Number(amount));
      setBalance(data.balance);
      setAmount("");
      toast.success("Баланс успешно пополнен");
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error("Не удалось пополнить баланс");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    if (Number(amount) > balance) {
      toast.error("Недостаточно средств");
      return;
    }

    setIsLoading(true);
    try {
      const data = await updateBalance(-Number(amount));
      setBalance(data.balance);
      setAmount("");
      toast.success("Средства успешно выведены");
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error("Не удалось вывести средства");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-md mx-auto p-4">
        <div className="bg-base-300 rounded-xl p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Управление балансом</h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              <span className="text-3xl font-bold">{balance} ₽</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Сумма</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Введите сумму"
                className="input input-bordered w-full"
                min="0"
                step="1"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeposit}
                disabled={isLoading || !amount}
                className="btn btn-primary flex-1 gap-2"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Пополнить
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isLoading || !amount}
                className="btn btn-outline flex-1 gap-2"
              >
                <ArrowDownCircle className="w-5 h-5" />
                Вывести
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancePage; 