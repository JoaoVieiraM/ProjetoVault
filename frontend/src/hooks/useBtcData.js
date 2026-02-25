import { useState, useEffect, useRef } from 'react'
import { getBtcPrice, getBrlRate, getBtcBalance } from '../lib/api'

const POLL_INTERVAL = 60_000 // 60 seconds

export function useBtcData(btcAddress) {
  const [btcPrice, setBtcPrice] = useState(null)   // USD
  const [brlRate, setBrlRate] = useState(null)      // BRL per USD
  const [balance, setBalance] = useState(null)      // BTC satoshis
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  async function fetchPrices() {
    try {
      const [priceData, rateData] = await Promise.all([getBtcPrice(), getBrlRate()])
      setBtcPrice(priceData.usd)
      setBrlRate(rateData.brl)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  async function fetchBalance() {
    if (!btcAddress) return
    try {
      const data = await getBtcBalance(btcAddress)
      setBalance(data.confirmed_satoshis)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    fetchPrices()
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [btcAddress])

  // BTC amount from satoshis
  const btcAmount = balance != null ? balance / 1e8 : null
  // Values in BRL and USD
  const balanceUsd = btcAmount != null && btcPrice != null ? btcAmount * btcPrice : null
  const balanceBrl = balanceUsd != null && brlRate != null ? balanceUsd * brlRate : null

  return { btcPrice, brlRate, btcAmount, balanceUsd, balanceBrl, lastUpdated, error, refetch: fetchPrices }
}
