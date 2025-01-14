"use client"

import {DEPLOY_RECORD, PACKAGE_ID} from "@/config/site"
import {useEffect, useState} from "react"
import {useWallet} from "@suiet/wallet-kit"
import {TransactionBlock} from '@mysten/sui.js/transactions'
import TickList from "@/components/tick-table"
import {getSuiDynamicFields} from "@/lib/apis"

export default function IndexPage() {
  const {connected, address, signAndExecuteTransactionBlock} = useWallet()
  const [loading, setLoading] = useState(false)
  const [ticks, setTicks] = useState([])
  const [refreshData, setRefreshData] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSuiDynamicFields(DEPLOY_RECORD, 'record').then((res) => {
      console.log(res)
      // @ts-ignore
      setTicks(res)
      setLoading(false)
    }).catch((err) => {
      console.log(err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (refreshData) {
      setLoading(true)
      getSuiDynamicFields(DEPLOY_RECORD, 'record').then((res) => {
        // @ts-ignore
        setTicks(res)
        setLoading(false)
        setRefreshData(false)
      }).catch((err) => {
        console.log(err)
        setLoading(false)
        setRefreshData(false)
      })
    }
  }, [refreshData])

  const deploy_move = async () => {
    if (!connected) return

    // define a programmable transaction
    const tx = new TransactionBlock()

    tx.moveCall({
      target: `${PACKAGE_ID}::movescription::deploy`,
      arguments: [
        tx.object(DEPLOY_RECORD),
        tx.pure("tests"),
        tx.pure(100_0000_0000),
        tx.pure(Date.now() + 120000),
        tx.pure(60 * 24 * 15),
        tx.pure(1000),
        tx.object("0x6")
      ],
      typeArguments: [],
    })

    try {
      // execute the programmable transaction
      const resData = await signAndExecuteTransactionBlock({
        // @ts-ignore
        transactionBlock: tx,
      })
      setRefreshData(true)
      console.log('deploy successfully!', resData)
    } catch (e) {
      setRefreshData(true)
      console.error('deploy failed', e)
    }
  }

  return (
    <section className="MContainer">
      <TickList deploy_tick={deploy_move} data={ticks}/>
    </section>
  )
}
