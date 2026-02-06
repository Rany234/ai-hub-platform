import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getTransactions, getWallet, mockDeposit } from "@/app/actions/wallet";

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return num.toFixed(2);
}

export default async function WalletPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/wallet");
  }

  const wallet = await getWallet();
  const transactions = await getTransactions();

  const balance = Number(wallet.balance ?? 0);
  const frozen = Number(wallet.frozen_amount ?? 0);
  const total = balance + frozen;

  async function depositAction() {
    "use server";
    await mockDeposit(100);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">钱包</h1>
        <form action={depositAction}>
          <Button type="submit">模拟充值 +100</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">总资产</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold">￥{formatMoney(total)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">可用余额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold">￥{formatMoney(balance)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">托管中资金</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold">￥{formatMoney(frozen)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>交易流水</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    暂无记录
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.created_at ? new Date(t.created_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(t.amount) >= 0 ? "+" : ""}{formatMoney(t.amount)}
                    </TableCell>
                    <TableCell>{t.description ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
