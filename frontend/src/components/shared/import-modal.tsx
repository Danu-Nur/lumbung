'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import * as XLSX from 'xlsx';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImportModalProps {
    type: 'categories' | 'stock' | 'transfers' | 'adjustments' | 'opname' | 'warehouses';
    trigger?: React.ReactNode;
    onImport: (data: any[]) => Promise<{ success: boolean; errors?: string[] }>;
    onSuccess?: () => void;
    templateUrl?: string; // Optional URL for static template
    templateFileName?: string;
    sampleData?: any[]; // Or provide sample data to generate template on the fly
}

export function ImportModal({
    type,
    trigger,
    onImport,
    onSuccess,
    templateUrl,
    templateFileName = 'template.xlsx',
    sampleData
}: ImportModalProps) {
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);
    const [errorList, setErrorList] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStats(null);
            setErrorList([]);
            setProgress(0);
        }
    };

    const generateTemplate = () => {
        if (templateUrl) {
            window.location.href = templateUrl;
            return;
        }

        if (!sampleData) return;

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, templateFileName);
    };

    const processFile = async () => {
        if (!file || isLoading) return;

        setIsLoading(true);
        setProgress(0);
        setProgress(0);
        setStats(null);
        setErrorList([]);

        try {
            const data = await parseExcel(file);
            const totalRows = data.length;
            const batchSize = 500;
            const batches = Math.ceil(totalRows / batchSize);

            let successCount = 0;
            let failedCount = 0;
            const allErrors: string[] = [];

            for (let i = 0; i < batches; i++) {
                const start = i * batchSize;
                const end = Math.min(start + batchSize, totalRows);
                const batch = data.slice(start, end);
                const sanitizedBatch = JSON.parse(JSON.stringify(batch));

                const result = await onImport(sanitizedBatch);

                if (result.success) {
                    successCount += batch.length;
                } else {
                    failedCount += batch.length; // Or parse specific errors if backend returns detailed breakdown
                    if (result.errors) allErrors.push(...result.errors);
                }

                const currentProgress = Math.round(((i + 1) / batches) * 100);
                setProgress(currentProgress);
            }

            setStats({
                total: totalRows,
                success: successCount,
                failed: failedCount
            });
            setErrorList(allErrors);

            if (failedCount === 0) {
                toast.success(t('actions.importSuccess', { count: totalRows }));
                if (onSuccess) onSuccess();
                setTimeout(() => setOpen(false), 2000);
            } else {
                toast.warning(t('actions.importPartialSuccess', { success: successCount, failed: failedCount }));
            }

        } catch (error: any) {
            console.error('Import failed:', error);
            toast.error(error.message || t('actions.importError'));
        } finally {
            setIsLoading(false);
        }
    };

    const parseExcel = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        {t('import.trigger')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('import.title', { type: t(`import.types.${type}`) })}</DialogTitle>
                    <DialogDescription>
                        {t('import.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">{t('import.downloadTemplate')}</p>
                                <p className="text-xs text-muted-foreground">{t('import.templateHelper')}</p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={generateTemplate}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('import.templateButton')}
                        </Button>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">{t('import.fileLabel')}</Label>
                        <Input
                            ref={fileInputRef}
                            id="file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>

                    {file && (
                        <div className="text-sm text-muted-foreground">
                            {t('import.selected', { name: file.name, size: (file.size / 1024).toFixed(1) })}
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{t('import.processing')}</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    )}

                    {stats && (
                        <div className="space-y-2">
                            <Alert variant={stats.failed > 0 ? "destructive" : "default"} className={stats.failed === 0 ? "border-green-500 text-green-600" : ""}>
                                {stats.failed === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{stats.failed === 0 ? t('import.status.successTitle') : t('import.status.partialTitle')}</AlertTitle>
                                <AlertDescription>
                                    {t('import.status.details', { total: stats.total, success: stats.success, failed: stats.failed })}
                                </AlertDescription>
                            </Alert>

                            {errorList.length > 0 && (
                                <div className="max-h-40 overflow-y-auto p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                                    <p className="font-semibold mb-1">{t('import.errors.title')}</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {errorList.map((err, i) => (
                                            <li key={i} className="break-words">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        {t('import.cancel')}
                    </Button>
                    <Button onClick={processFile} disabled={!file || isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('import.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
