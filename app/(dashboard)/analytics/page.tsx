"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Shield, 
  Package, 
  FileText, 
  Search, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Download,
  Eye
} from "lucide-react"
import { useState } from "react"

export default function AnalyticsPage() {
  const [cveId, setCveId] = useState("")
  const [productName, setProductName] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cveError, setCveError] = useState("")

  // CVE 번호 형식 검증 함수
  const validateCveId = (value: string) => {
    const cvePattern = /^CVE-\d{4}-\d{4,}$/
    return cvePattern.test(value)
  }

  const handleCveIdChange = (value: string) => {
    setCveId(value)
    if (value && !validateCveId(value)) {
      setCveError("올바른 CVE 형식을 입력하세요 (예: CVE-2024-1234)")
    } else {
      setCveError("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleAnalysis = async () => {
    if (!cveId.trim() && !productName.trim() && !uploadedFile) {
      alert("CVE ID, 제품명, 또는 파일 중 하나는 입력해주세요.")
      return
    }

    // CVE ID가 입력되었을 때 형식 검증
    if (cveId.trim() && !validateCveId(cveId.trim())) {
      setCveError("올바른 CVE 형식을 입력하세요 (예: CVE-2024-1234)")
      return
    }

    setIsAnalyzing(true)
    
    try {
      // 백엔드 API 호출
      const response = await fetch('/api/analyze-threat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cveId: cveId.trim(),
          productName: productName.trim(),
          fileName: uploadedFile?.name || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '분석 요청에 실패했습니다.')
      }

      const result = await response.json()
      setAnalysisResults(result)
      
    } catch (error) {
      console.error('분석 오류:', error)
      alert(`분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CVE Analytics</h1>
        <p className="text-muted-foreground">
          CVE 위협 분석 및 예측을 위한 종합 분석 도구
        </p>
      </div>

      {/* 입력 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            위협 분석 입력
          </CardTitle>
          <CardDescription>
            CVE ID, 제품명, 또는 파일을 업로드하여 위협을 분석하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cve-id" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                CVE ID
              </Label>
              <Input
                id="cve-id"
                placeholder="CVE-2024-1234"
                value={cveId}
                onChange={(e) => handleCveIdChange(e.target.value)}
                className={cveError ? "border-red-500 focus:border-red-500" : ""}
              />
              {cveError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {cveError}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-name" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                제품명
              </Label>
              <Input
                id="product-name"
                placeholder="제품명을 입력하세요"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              파일 업로드
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                accept=".json,.xml,.txt,.csv"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {uploadedFile && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {uploadedFile.name}
                </Badge>
              )}
            </div>
          </div>

          <Button 
            onClick={handleAnalysis} 
            disabled={isAnalyzing || (cveId.trim() && cveError)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                위협 분석 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {analysisResults && (
        <div className="space-y-6">
          {/* 요약 정보 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">위험도</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(analysisResults.riskLevel)}`} />
                  <span className="text-2xl font-bold">{analysisResults.riskLevel}</span>
                </div>
                <p className="text-xs text-muted-foreground">위험 수준</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CVSS</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisResults.cvssScore}</div>
                <p className="text-xs text-muted-foreground">취약점 심각도</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EPSS</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analysisResults.epssScore * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">악용 확률</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">악용 상태</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisResults.exploitability}</div>
                <p className="text-xs text-muted-foreground">현재 상태</p>
              </CardContent>
            </Card>
          </div>

          {/* 상세 정보 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>영향받는 버전</CardTitle>
                <CardDescription>취약점이 확인된 제품 버전</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisResults.affectedVersions.map((version: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {version}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>권장 조치</CardTitle>
                <CardDescription>즉시 취해야 할 보안 조치</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 타임라인 */}
          <Card>
            <CardHeader>
              <CardTitle>취약점 타임라인</CardTitle>
              <CardDescription>취약점 발견부터 현재까지의 주요 이벤트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.status === 'discovered' ? 'bg-blue-500' :
                        event.status === 'assigned' ? 'bg-yellow-500' :
                        event.status === 'published' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      {index < analysisResults.timeline.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.event}</div>
                      <div className="text-sm text-muted-foreground">{event.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              보고서 다운로드
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              상세 분석 보기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}