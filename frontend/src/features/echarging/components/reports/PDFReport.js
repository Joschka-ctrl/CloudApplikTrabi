import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    marginTop: 20,
    borderBottom: '1px solid #ccc',
    paddingBottom: 5,
  },
  statCard: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #ccc',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '45%',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  dateRange: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  chart: {
    width: '100%',
    height: 'auto',
    maxHeight: 300,
  }
});

const waitForChartRender = () => new Promise(resolve => setTimeout(resolve, 500));

const captureChart = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    await waitForChartRender();
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
};

const PDFReport = ({ 
  stats, 
  utilizationData, 
  providerRevenue,
  dateRange,
  selectedGarage
}) => {
  const [chartImages, setChartImages] = React.useState({
    utilization: null,
    sessions: null,
    revenue: null
  });

  React.useEffect(() => {
    const captureCharts = async () => {
      const [utilizationChart, sessionsChart, revenueChart] = await Promise.all([
        captureChart('utilization-chart'),
        captureChart('sessions-chart'),
        captureChart('revenue-chart')
      ]);

      setChartImages({
        utilization: utilizationChart,
        sessions: sessionsChart,
        revenue: revenueChart
      });
    };

    captureCharts();
  }, []);

  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>E-Charging Report</Text>
            
            <Text style={styles.dateRange}>
              {dateRange.startDate ? `From: ${dateRange.startDate}` : ''} 
              {dateRange.endDate ? ` To: ${dateRange.endDate}` : ''}
              {selectedGarage ? `\nGarage: ${selectedGarage}` : ''}
            </Text>

            <Text style={styles.subtitle}>General Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statCard}>
                  <Text style={styles.label}>Total Sessions</Text>
                  <Text style={styles.value}>{stats?.totalSessions || 0}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statCard}>
                  <Text style={styles.label}>Total Energy (kWh)</Text>
                  <Text style={styles.value}>{stats?.totalEnergy?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statCard}>
                  <Text style={styles.label}>Avg. Session Duration (h)</Text>
                  <Text style={styles.value}>{stats?.averageSessionDuration?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statCard}>
                  <Text style={styles.label}>Avg. Energy per Session (kWh)</Text>
                  <Text style={styles.value}>{stats?.averageEnergyPerSession?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            </View>

            {chartImages.utilization && (
              <>
                <Text style={styles.subtitle}>Station Utilization</Text>
                <View style={styles.chartContainer}>
                  <Image src={chartImages.utilization} style={styles.chart} />
                </View>
              </>
            )}

            {chartImages.sessions && (
              <>
                <Text style={styles.subtitle}>Daily Sessions</Text>
                <View style={styles.chartContainer}>
                  <Image src={chartImages.sessions} style={styles.chart} />
                </View>
              </>
            )}

            {providerRevenue && chartImages.revenue && (
              <>
                <Text style={styles.subtitle}>Revenue Analysis</Text>
                <View style={styles.statsGrid}>
                  {Object.entries(providerRevenue).map(([provider, data]) => (
                    <View key={provider} style={styles.statItem}>
                      <View style={styles.statCard}>
                        <Text style={styles.label}>{provider}</Text>
                        <Text style={styles.value}>{data.totalRevenue?.toFixed(2) || '0.00'} €</Text>
                        <Text style={styles.label}>Sessions: {data.sessionCount}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.chartContainer}>
                  <Image src={chartImages.revenue} style={styles.chart} />
                </View>
              </>
            )}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFReport;
