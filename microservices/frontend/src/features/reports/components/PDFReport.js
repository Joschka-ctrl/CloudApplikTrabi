import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import {
  PDFDailyUsageChart,
  PDFDurationChart,
  PDFRevenueChart,
  PDFFloorOccupancyChart,
  PDFFloorUsageChart
} from './pdf/ChartComponents';

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
    marginBottom: 20,
  },
  statItem: {
    width: '45%',
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 5,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
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
    height: 300,
    width: '100%',
  },
  chart: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
});

const waitForChartRender = () => new Promise(resolve => setTimeout(resolve, 1000));

const captureChart = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    await waitForChartRender();
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 800,
      height: 400,
      backgroundColor: '#ffffff'
    });
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
};

const PDFReport = ({ 
  metrics,
  dailyUsageData,
  durationStats,
  revenueStats,
  floorStats,
  selectedParkingPlace,
  dateRange,
  onPDFLoaded
}) => {
  const [chartImages, setChartImages] = useState({
    dailyUsage: null,
    duration: null,
    revenue: null,
    floorOccupancy: null,
    floorUsage: null
  });

  useEffect(() => {
    let chartsContainer = null;
    let chartRoot = null;
    let isUnmounting = false;

    const cleanup = () => {
      setTimeout(() => {
        if (chartRoot) {
          chartRoot.unmount();
          chartRoot = null;
        }
        if (chartsContainer && document.body.contains(chartsContainer)) {
          document.body.removeChild(chartsContainer);
          chartsContainer = null;
        }
      }, 0);
    };

    const captureCharts = async () => {
      if (isUnmounting) return;

      try {
        // Create container for charts
        chartsContainer = document.createElement('div');
        chartsContainer.style.position = 'absolute';
        chartsContainer.style.left = '-9999px';
        chartsContainer.style.width = '800px';
        chartsContainer.style.height = '400px';
        chartsContainer.style.backgroundColor = '#ffffff';
        document.body.appendChild(chartsContainer);

        // Create divs for each chart with specific dimensions
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '800px';
        chartContainer.style.backgroundColor = '#ffffff';
        chartsContainer.appendChild(chartContainer);

        // Create and render charts
        chartRoot = ReactDOM.createRoot(chartContainer);
        chartRoot.render(
          <div style={{ width: '800px', backgroundColor: '#ffffff' }}>
            <div id="pdf-daily-usage-chart" style={{ width: '800px', height: '400px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {dailyUsageData && <PDFDailyUsageChart data={dailyUsageData} />}
            </div>
            <div id="pdf-parking-duration-chart" style={{ width: '800px', height: '400px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {durationStats && <PDFDurationChart data={durationStats} />}
            </div>
            <div id="pdf-revenue-chart" style={{ width: '800px', height: '400px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {revenueStats && <PDFRevenueChart data={revenueStats} />}
            </div>
            <div id="pdf-floor-occupancy-chart" style={{ width: '800px', height: '400px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {floorStats?.occupancyData && <PDFFloorOccupancyChart data={floorStats.occupancyData} />}
            </div>
            <div id="pdf-floor-usage-chart" style={{ width: '800px', height: '400px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {floorStats?.usageData && <PDFFloorUsageChart data={floorStats.usageData} />}
            </div>
          </div>
        );

        // Wait longer for charts to render
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (isUnmounting) {
          cleanup();
          return;
        }

        // Capture all charts with specific options
        const captureOptions = {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          width: 800,
          height: 400,
          onclone: function(clonedDoc) {
            console.log('Cloned elements:', clonedDoc.getElementById('pdf-daily-usage-chart'));
          }
        };

        // Capture charts one by one with error handling
        const captureChart = async (elementId) => {
          const element = document.getElementById(elementId);
          if (!element) {
            console.log(`Element not found: ${elementId}`);
            return null;
          }
          try {
            const canvas = await html2canvas(element, captureOptions);
            return canvas.toDataURL('image/png');
          } catch (error) {
            console.error(`Error capturing ${elementId}:`, error);
            return null;
          }
        };

        const dailyUsageImage = dailyUsageData ? await captureChart('pdf-daily-usage-chart') : null;
        const durationImage = durationStats ? await captureChart('pdf-parking-duration-chart') : null;
        const revenueImage = revenueStats ? await captureChart('pdf-revenue-chart') : null;
        const floorOccupancyImage = floorStats?.occupancyData ? await captureChart('pdf-floor-occupancy-chart') : null;
        const floorUsageImage = floorStats?.usageData ? await captureChart('pdf-floor-usage-chart') : null;

        if (isUnmounting) {
          cleanup();
          return;
        }

        setChartImages({
          dailyUsage: dailyUsageImage,
          duration: durationImage,
          revenue: revenueImage,
          floorOccupancy: floorOccupancyImage,
          floorUsage: floorUsageImage
        });

        onPDFLoaded();
      } catch (error) {
        console.error('Error capturing charts:', error);
        onPDFLoaded();
      } finally {
        if (!isUnmounting) {
          cleanup();
        }
      }
    };

    captureCharts();

    return () => {
      isUnmounting = true;
      cleanup();
    };
  }, [dailyUsageData, durationStats, revenueStats, floorStats]);

  return (
    <PDFViewer style={{ width: '100%', height: '70vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Parking Report</Text>
          <Text style={styles.dateRange}>
            {selectedParkingPlace} - {dateRange.startDate} to {dateRange.endDate}
          </Text>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Key Metrics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.label}>Total Parked Vehicles</Text>
                <Text style={styles.value}>{metrics.totalParkedVehicles}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.label}>Average Duration</Text>
                <Text style={styles.value}>{metrics.averageDuration}</Text>
              </View>
            </View>
          </View>

          {chartImages.dailyUsage && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.subtitle}>Daily Usage</Text>
              <View style={styles.chartContainer}>
                <Image 
                  src={chartImages.dailyUsage} 
                  style={styles.chart}
                />
              </View>
            </View>
          )}

          {chartImages.duration && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.subtitle}>Parking Duration Distribution</Text>
              <View style={styles.chartContainer}>
                <Image 
                  src={chartImages.duration} 
                  style={styles.chart}
                />
              </View>
            </View>
          )}

          {chartImages.revenue && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.subtitle}>Daily Revenue</Text>
              <View style={styles.chartContainer}>
                <Image 
                  src={chartImages.revenue} 
                  style={styles.chart}
                />
              </View>
            </View>
          )}

          {chartImages.floorOccupancy && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.subtitle}>Floor Occupancy</Text>
              <View style={styles.chartContainer}>
                <Image 
                  src={chartImages.floorOccupancy} 
                  style={styles.chart}
                />
              </View>
            </View>
          )}

          {chartImages.floorUsage && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.subtitle}>Floor Usage Pattern</Text>
              <View style={styles.chartContainer}>
                <Image 
                  src={chartImages.floorUsage} 
                  style={styles.chart}
                />
              </View>
            </View>
          )}
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFReport;
