import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DynamicItem {
    id: string;
    source: string; // or description/name
    amount?: number; // for income/expense
    value?: number; // for asset
    taxPaid?: number; // for income
    isTaxable?: boolean; // for income
    type?: string;
}

interface DynamicFinanceSectionProps {
    title: string;
    description: string;
    items: DynamicItem[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: 'source' | 'amount' | 'value' | 'taxPaid' | 'isTaxable', value: string | number | boolean) => void;
    type: 'income' | 'asset' | 'expense';
    icon?: React.ReactNode;
}

export function DynamicFinanceSection({
    title,
    description,
    items,
    onAdd,
    onRemove,
    onUpdate,
    type,
    icon
}: DynamicFinanceSectionProps) {
    const valueKey = type === 'asset' ? 'value' : 'amount';
    const total = items.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

    return (
        <Card className="border rounded-lg bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>}
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs uppercase text-muted-foreground font-semibold tracking-wider">Total</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50/30">
                        <TableRow>
                            <TableHead className={type === 'income' ? "w-[30%]" : "w-[50%]"}>Source / Description</TableHead>
                            <TableHead className={type === 'income' ? "w-[20%]" : "w-[35%]"}>
                                {type === 'asset' ? 'Current Amount (USD)' : 'Amount (USD)'}
                            </TableHead>
                            {type === 'income' && (
                                <>
                                    <TableHead className="w-[20%]">Tax Status</TableHead>
                                    <TableHead className="w-[20%]">Tax Paid (USD)</TableHead>
                                </>
                            )}
                            <TableHead className="w-[10%] text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={type === 'income' ? 5 : 3} className="text-center py-8 text-muted-foreground italic">
                                    No items added yet. Click "Add Item" to start.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="group hover:bg-gray-50/50">
                                    <TableCell>
                                        <Input
                                            value={item.source}
                                            onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                            placeholder={type === 'income' ? "e.g. Salary, Rental..." : type === 'asset' ? "e.g. Savings, Home..." : "e.g. Childcare, Tuition..."}
                                            className="border-transparent hover:border-input focus:border-input bg-transparent"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                value={item[valueKey] ? item[valueKey]?.toLocaleString() : ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                                    const val = raw ? parseInt(raw, 10) : 0;
                                                    onUpdate(item.id, valueKey, val);
                                                }}
                                                placeholder="0"
                                                className="pl-7 border-transparent hover:border-input focus:border-input bg-transparent font-medium"
                                            />
                                        </div>
                                    </TableCell>
                                    {type === 'income' && (
                                        <>
                                            <TableCell>
                                                <select
                                                    className="w-full bg-transparent border-transparent hover:border-input focus:border-input rounded-md text-sm p-2"
                                                    value={item.isTaxable ? 'taxed' : 'untaxed'}
                                                    onChange={(e) => {
                                                        const isTaxable = e.target.value === 'taxed';
                                                        // @ts-ignore
                                                        onUpdate(item.id, 'isTaxable', isTaxable);
                                                        if (!isTaxable) {
                                                            // @ts-ignore
                                                            onUpdate(item.id, 'taxPaid', 0);
                                                        }
                                                    }}
                                                >
                                                    <option value="untaxed">Untaxed</option>
                                                    <option value="taxed">Taxed</option>
                                                </select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    {item.isTaxable ? (
                                                        <>
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                // @ts-ignore - dynamic key access
                                                                value={item.taxPaid ? item.taxPaid?.toLocaleString() : ''}
                                                                onChange={(e) => {
                                                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                                                    const val = raw ? parseInt(raw, 10) : 0;
                                                                    // @ts-ignore
                                                                    onUpdate(item.id, 'taxPaid', val);
                                                                }}
                                                                placeholder="Tax"
                                                                className="pl-7 border-transparent hover:border-input focus:border-input bg-transparent font-medium text-red-600"
                                                            />
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm pl-2">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemove(item.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="p-4 border-t bg-gray-50/30">
                    <Button
                        variant="ghost"
                        onClick={onAdd}
                        className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-2 w-full sm:w-auto border border-dashed border-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
